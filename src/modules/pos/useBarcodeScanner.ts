"use client";

import { useEffect, useRef } from "react";

interface UseBarcodeScannerProps {
  onScan: (code: string) => void;
  enabled?: boolean;
  minChars?: number;
  maxIntervalMs?: number;
}

export function useBarcodeScanner({
  onScan,
  enabled = true,
  minChars = 3,
  maxIntervalMs = 60,
}: UseBarcodeScannerProps) {
  const bufferRef = useRef<string>("");
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when active element is an input, textarea or contenteditable
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const now = Date.now();
      const interval = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if (e.key === "Enter") {
        if (bufferRef.current.length >= minChars) {
          const barcode = bufferRef.current;
          bufferRef.current = "";
          onScan(barcode);
        } else {
          bufferRef.current = "";
        }
        return;
      }

      if (e.key.length === 1) {
        // If interval between keystrokes is too long, reset buffer (means human typing, not scanner)
        if (interval > maxIntervalMs && bufferRef.current.length > 0) {
          bufferRef.current = "";
        }
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onScan, minChars, maxIntervalMs]);
}
