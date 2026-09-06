"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  Barcode,
  Camera,
  CheckCircle2,
  Flashlight,
  FlashlightOff,
  Loader2,
  RefreshCw,
  ScanLine,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

interface PosCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
}

export function PosCameraScannerModal({
  isOpen,
  onClose,
  onScan,
  isProcessing,
  errorMessage,
}: PosCameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);

  const scanIntervalRef = useRef<any>(null);
  const isScanningActiveRef = useRef(false);
  const lastScannedTimeRef = useRef(0);

  // Play a crisp beep tone using Web Audio API on barcode detect
  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // High pitch crisp 1760Hz
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  // Haptic feedback (Vibrate on mobile)
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
  }, []);

  // Handle successful code capture
  const handleCodeDetected = useCallback(
    (code: string) => {
      const now = Date.now();
      // Debounce detections (prevent duplicate triggers within 1.8s)
      if (now - lastScannedTimeRef.current < 1800) return;
      lastScannedTimeRef.current = now;

      playBeep();
      triggerHaptic();
      setScannedFeedback(code);

      setTimeout(() => {
        setScannedFeedback(null);
        onScan(code);
      }, 500);
    },
    [onScan, playBeep, triggerHaptic]
  );

  // Toggle Flash/Torch on mobile device
  const toggleTorch = async () => {
    if (!stream) return;
    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
      if ((capabilities as any).torch) {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      }
    } catch (e) {
      console.warn("Torch not supported on this device:", e);
    }
  };

  // Main Camera & Barcode Decoder Engine Lifecycle
  useEffect(() => {
    let localStream: MediaStream | null = null;

    if (isOpen) {
      setHasCameraError(false);
      setCameraErrorMessage("");
      setScannedFeedback(null);
      isScanningActiveRef.current = true;

      // Ensure BarcodeDetector or fallback engine is available
      if (typeof window !== "undefined" && !(window as any).BarcodeDetector) {
        // Load BarcodeDetector polyfill via CDN dynamically if not available natively
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@undecaf/barcode-detector-polyfill@latest/dist/barcode-detector-polyfill.min.js";
        script.async = true;
        script.onload = () => {
          setIsEngineReady(true);
        };
        script.onerror = () => {
          setIsEngineReady(true);
        };
        document.body.appendChild(script);
      } else {
        setIsEngineReady(true);
      }

      // Request Rear/Environment Camera with Full HD or autofocus constraints
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          })
          .then((s) => {
            localStream = s;
            setStream(s);
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              videoRef.current.play().catch(() => {});
            }
          })
          .catch((err) => {
            console.warn("Camera access failed:", err);
            setHasCameraError(true);
            setCameraErrorMessage(err.message || "Camera permission denied or not available");
          });
      } else {
        setHasCameraError(true);
        setCameraErrorMessage("Camera API is not supported in this browser context (HTTPS required)");
      }
    }

    return () => {
      isScanningActiveRef.current = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  // Real-time Barcode Processing Loop (Continuous Video Frame Analysis)
  useEffect(() => {
    if (!isOpen || hasCameraError || !isEngineReady) return;

    let detector: any = null;

    try {
      const DetectorClass = (window as any).BarcodeDetector;
      if (DetectorClass) {
        detector = new DetectorClass({
          formats: [
            "code_128",
            "ean_13",
            "ean_8",
            "upc_a",
            "upc_e",
            "code_39",
            "code_93",
            "itf",
            "qr_code",
          ],
        });
      }
    } catch (e) {
      console.warn("Error initializing BarcodeDetector formats:", e);
    }

    const processFrame = async () => {
      if (!isScanningActiveRef.current || !videoRef.current || isProcessing) return;
      const video = videoRef.current;

      if (video.readyState < 2 || video.videoWidth === 0) return;

      try {
        if (detector) {
          // Native Barcode Detection
          const barcodes = await detector.detect(video);
          if (barcodes && barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            if (rawValue && rawValue.trim().length > 0) {
              handleCodeDetected(rawValue.trim());
              return;
            }
          }
        }
      } catch (err) {
        // Frame detection skip (silent)
      }
    };

    // Scan every 150ms for responsive 6-7 FPS detection
    scanIntervalRef.current = setInterval(processFrame, 150);

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
    };
  }, [isOpen, hasCameraError, isEngineReady, isProcessing, handleCodeDetected]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      playBeep();
      triggerHaptic();
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92dvh] animate-in zoom-in-95 duration-200">
        
        {/* Header - Cyber / Tech Barcode Scanner */}
        <div className="p-3.5 sm:p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ScanLine className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-wide">LASER BARCODE SCANNER</h3>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  LIVE 60FPS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Align 1D Barcode (Code-128 / EAN-13) inside frame</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute beep sound" : "Enable beep sound"}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Viewfinder Area */}
        <div className="relative bg-black w-full h-64 sm:h-72 flex items-center justify-center overflow-hidden select-none">
          {!hasCameraError ? (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* High-Tech Futuristic HUD Viewfinder Target Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                <div className="w-64 sm:w-72 h-36 relative flex flex-col justify-between">
                  
                  {/* Glowing 4 HUD Corner Brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-blue-400 rounded-tl-xl shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-blue-400 rounded-tr-xl shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-blue-400 rounded-bl-xl shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-blue-400 rounded-br-xl shadow-[0_0_12px_rgba(96,165,250,0.8)]" />

                  {/* High Visibility Scanning Target Grid */}
                  <div className="w-full h-full border border-blue-500/20 rounded-xl relative overflow-hidden bg-blue-500/5 backdrop-blur-[0.5px]">
                    
                    {/* Animated Red/Cyan Laser Beam Sweep */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ef4444] animate-[scanLaser_2s_ease-in-out_infinite]" />
                    
                    {/* Center Crosshair Guides */}
                    <div className="absolute top-1/2 left-3 w-4 h-0.5 bg-blue-400/50 -translate-y-1/2" />
                    <div className="absolute top-1/2 right-3 w-4 h-0.5 bg-blue-400/50 -translate-y-1/2" />
                    <div className="absolute top-3 left-1/2 w-0.5 h-4 bg-blue-400/50 -translate-x-1/2" />
                    <div className="absolute bottom-3 left-1/2 w-0.5 h-4 bg-blue-400/50 -translate-x-1/2" />
                  </div>

                  {/* Target Label */}
                  <div className="text-center mt-2">
                    <span className="inline-block px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-full text-[10px] font-black text-blue-400 border border-blue-500/30 tracking-wider uppercase shadow-lg">
                      Point at Product Barcode
                    </span>
                  </div>
                </div>
              </div>

              {/* Torch / Flash Button (Floating) */}
              <button
                type="button"
                onClick={toggleTorch}
                className={`absolute bottom-3 right-3 p-2.5 rounded-2xl backdrop-blur-md border transition-all cursor-pointer shadow-lg ${
                  torchOn
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-amber-400/30"
                    : "bg-slate-900/80 text-slate-300 border-slate-700 hover:text-white"
                }`}
                title="Toggle Torch / Flashlight"
              >
                {torchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
              </button>

              {/* Instant Scanned Success Overlay */}
              {scannedFeedback && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 animate-in zoom-in-95 duration-150">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.8)]">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-emerald-300 tracking-wider">BARCODE DETECTED!</p>
                    <p className="text-base font-black font-mono text-white mt-0.5">{scannedFeedback}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black text-rose-300">Camera Access Blocked</p>
                <p className="text-[10.5px] text-slate-400 mt-1 max-w-xs mx-auto">
                  {cameraErrorMessage || "HTTPS or local permission is required to access mobile camera."}
                </p>
              </div>
            </div>
          )}

          {/* Processing / Adding to Cart Spinner */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center gap-2.5 text-white text-xs font-bold">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="tracking-wide">Adding Product to POS Cart...</span>
            </div>
          )}
        </div>

        {/* Backend Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/50 border-y border-rose-800/60 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manual Barcode / SKU Input Form */}
        <form onSubmit={handleManualSubmit} className="p-4 bg-slate-950 space-y-2.5 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Manual Barcode / SKU Search</span>
            <span className="text-[10px] text-slate-500">Press Enter or click Scan</span>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="w-4 h-4 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. 890123400005 or PB-MAG-005"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim() || isProcessing}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-wide transition-all shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              Scan
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes scanLaser {
          0% {
            top: 5%;
            opacity: 0.9;
          }
          50% {
            top: 85%;
            opacity: 1;
          }
          100% {
            top: 5%;
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

