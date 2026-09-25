"use client";

import React, { useState } from "react";
import { X, Delete, Equal } from "lucide-react";

interface PosCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PosCalculatorModal({ isOpen, onClose }: PosCalculatorModalProps) {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (resetNext || display === "0") {
      setDisplay(digit);
      setResetNext(false);
    } else {
      if (display.length < 12) {
        setDisplay(display + digit);
      }
    }
  };

  const handleDot = () => {
    if (resetNext) {
      setDisplay("0.");
      setResetNext(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperation(null);
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (resetNext) {
      setDisplay("0");
      setResetNext(false);
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = calculate(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, op: string) => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEqual = () => {
    if (operation && prevValue !== null) {
      const current = parseFloat(display);
      const result = calculate(prevValue, current, operation);
      setDisplay(String(Math.round(result * 1000000) / 1000000));
      setPrevValue(null);
      setOperation(null);
      setResetNext(true);
    }
  };

  const buttons = [
    { label: "C", action: handleClear, style: "bg-red-50 text-red-600 hover:bg-red-100 font-bold" },
    { label: "⌫", action: handleBackspace, style: "bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold" },
    { label: "%", action: () => setDisplay(String(parseFloat(display) / 100)), style: "bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold" },
    { label: "÷", action: () => handleOp("÷"), style: "bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-lg" },
    
    { label: "7", action: () => handleDigit("7"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "8", action: () => handleDigit("8"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "9", action: () => handleDigit("9"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "×", action: () => handleOp("×"), style: "bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-lg" },

    { label: "4", action: () => handleDigit("4"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "5", action: () => handleDigit("5"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "6", action: () => handleDigit("6"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "-", action: () => handleOp("-"), style: "bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-lg" },

    { label: "1", action: () => handleDigit("1"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "2", action: () => handleDigit("2"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "3", action: () => handleDigit("3"), style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: "+", action: () => handleOp("+"), style: "bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-lg" },

    { label: "0", action: () => handleDigit("0"), style: "col-span-2 bg-white text-slate-800 hover:bg-slate-100 font-bold text-base" },
    { label: ".", action: handleDot, style: "bg-white text-slate-800 hover:bg-slate-100 font-bold text-lg" },
    { label: "=", action: handleEqual, style: "bg-[#ea580c] text-white hover:bg-[#c2410c] font-bold text-lg shadow-sm" },
  ];

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4">
        <div 
          className="relative bg-white rounded-2xl w-full max-w-xs shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              POS Quick Calculator
            </span>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-right">
          <div className="text-xs text-slate-400 font-mono h-4">
            {prevValue !== null ? `${prevValue} ${operation || ""}` : ""}
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 overflow-x-auto whitespace-nowrap custom-scrollbar">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-3 grid grid-cols-4 gap-2 bg-slate-100">
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              type="button"
              onClick={btn.action}
              className={`p-3 rounded-xl border border-slate-200/80 active:scale-95 transition-all flex items-center justify-center shadow-2xs cursor-pointer ${btn.style}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}
