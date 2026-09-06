"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

interface QuantityInputProps {
    value: number;
    onUpdate: (newVal: number) => void;
}

export function QuantityInput({ value, onUpdate }: QuantityInputProps) {
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

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3 py-1 group/qty">
                <span className="text-[14px] font-bold text-heading min-w-[30px]">{value}</span>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-lg bg-[#F8FAFC] text-[#A0AEC0] hover:text-primary hover:bg-primary/5 transition-all"
                    title="Edit quantity"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative">
                <input
                    autoFocus
                    type="number"
                    value={localValue}
                    onChange={(e) => setLocalValue(parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                    }}
                    className="w-20 px-2 py-1.5 text-[13px] font-bold text-heading bg-white border border-primary/40 rounded-lg outline-none shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/10 transition-all"
                />
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={handleSave}
                    className="p-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors shadow-sm"
                    title="Save quantity"
                >
                    <Check className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleCancel}
                    className="p-1.5 bg-[#F1F5F9] text-[#718096] rounded-lg hover:bg-[#E2E8F0] transition-colors"
                    title="Cancel"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
