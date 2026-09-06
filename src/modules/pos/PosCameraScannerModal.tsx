"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  AlertCircle,
  Barcode,
  Camera,
  Loader2,
  RefreshCw,
  X,
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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let localStream: MediaStream | null = null;

    if (isOpen) {
      setHasCameraError(false);
      // Try to open rear/environment camera on mobile or default camera on desktop
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: "environment" },
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
          });
      } else {
        setHasCameraError(true);
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-black">Camera Barcode Scanner</h3>
              <p className="text-[11px] text-slate-400">Position barcode in view</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Viewfinder */}
        <div className="relative bg-black w-full h-64 flex items-center justify-center overflow-hidden">
          {!hasCameraError ? (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Target Scan Box Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-32 border-2 border-emerald-400/80 rounded-2xl relative animate-pulse shadow-2xl">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg" />
                  <div className="w-full h-0.5 bg-emerald-400/70 absolute top-1/2 -translate-y-1/2 animate-bounce" />
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs font-bold text-slate-300">Camera permission needed or unavailable</p>
              <p className="text-[11px] text-slate-500">You can type the barcode or SKU manually below</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-2 text-white text-xs font-bold">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
              <span>Checking Barcode...</span>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Manual Barcode Fallback Input */}
        <form onSubmit={handleManualSubmit} className="p-4 bg-white space-y-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600">Manual Barcode / SKU Input</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type barcode or SKU..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim() || isProcessing}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Scan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
