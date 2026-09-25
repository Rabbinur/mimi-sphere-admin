"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Check, X, Plus, Minus } from "lucide-react";

interface QuantityInputProps {
    value: number;
    onUpdate: (newVal: number) => void;
    showStepper?: boolean;
}

export function QuantityInput({ value, onUpdate, showStepper = false }: QuantityInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleSave = () => {
        onUpdate(localValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalValue(value);
        setIsEditing(false);
    };

    const handleStep = (delta: number) => {
        const next = Math.max(0, value + delta);
        if (typeof window !== "undefined" && navigator.vibrate) {
            try { navigator.vibrate(10); } catch (_) {}
        }
        onUpdate(next);
    };

    if (showStepper) {
        return (
            <div className="inline-flex items-center bg-slate-100/90 border border-slate-200 rounded-xl p-0.5 select-none shadow-2xs">
                <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    disabled={value <= 0}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 active:scale-90 disabled:opacity-30 disabled:hover:bg-white text-slate-700 font-black flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    title="Decrease 1"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>

                {isEditing ? (
                    <input
                        autoFocus
                        type="number"
                        value={localValue}
                        onChange={(e) => setLocalValue(parseInt(e.target.value) || 0)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                        }}
                        className="w-14 text-center text-xs font-black font-mono text-slate-900 bg-white border border-blue-500 rounded-md outline-none mx-1 py-1"
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="min-w-[36px] px-2 py-1 text-xs font-black font-mono text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-center"
                        title="Click to type exact stock"
                    >
                        {value}
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => handleStep(1)}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 active:scale-90 text-slate-700 font-black flex items-center justify-center transition-all shadow-xs cursor-pointer"
                    title="Increase 1"
                >
                    <Plus className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    if (!isEditing) {
        return (
            <div className="flex items-center gap-2 py-1 group/qty">
                <span className="text-[13px] font-black font-mono text-heading min-w-[24px]">{value}</span>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded-lg bg-slate-100 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                    title="Edit quantity"
                >
                    <Pencil className="w-3 h-3" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
            <input
                autoFocus
                type="number"
                value={localValue}
                onChange={(e) => setLocalValue(parseInt(e.target.value) || 0)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") handleCancel();
                }}
                className="w-16 px-2 py-1 text-xs font-black font-mono text-heading bg-white border border-primary rounded-lg outline-none shadow-xs focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <button
                onClick={handleSave}
                className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
                title="Save quantity"
            >
                <Check className="w-3 h-3" />
            </button>
            <button
                onClick={handleCancel}
                className="p-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                title="Cancel"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

