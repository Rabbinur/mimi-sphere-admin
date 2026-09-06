"use client";

import { Check, ChevronRight, Info } from "lucide-react";
import React from "react";

interface InventoryCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  variantCombinations: any[];
  handleGenerateSKU: () => void;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  formData,
  setFormData,
  variantCombinations,
  handleGenerateSKU,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-slate-800">
        Inventory & SKU
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Quantity */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            Quantity<span className="text-rose-500 ml-0.5">*</span>
          </label>
          <div
            className={`relative group overflow-hidden border ${formData.quantity === "0" || !formData.quantity
                ? "border-rose-400"
                : "border-slate-200"
              } rounded-lg`}
          >
            <input
              type="text"
              className={`w-full h-9 px-3 text-xs font-medium text-slate-800 outline-none ${variantCombinations.length > 0
                  ? "bg-slate-50 cursor-not-allowed text-slate-400"
                  : ""
                }`}
              value={formData.quantity}
              readOnly={variantCombinations.length > 0}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, quantity: val || "0" });
              }}
            />
            <div className="absolute right-0 top-0 h-full w-7 border-l border-slate-200 flex flex-col">
              <div
                className="flex-1 flex items-center justify-center border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => {
                  if (variantCombinations.length > 0) return;
                  const current = parseInt(formData.quantity) || 0;
                  setFormData({
                    ...formData,
                    quantity: (current + 1).toString(),
                  });
                }}
              >
                <ChevronRight className="-rotate-90 w-2.5 h-2.5 text-slate-400" />
              </div>
              <div
                className="flex-1 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => {
                  if (variantCombinations.length > 0) return;
                  const current = parseInt(formData.quantity) || 0;
                  if (current > 0) {
                    setFormData({
                      ...formData,
                      quantity: (current - 1).toString(),
                    });
                  }
                }}
              >
                <ChevronRight className="rotate-90 w-2.5 h-2.5 text-slate-400" />
              </div>
            </div>
          </div>
          {(formData.quantity === "0" || !formData.quantity) && (
            <p className="text-[10px] font-semibold text-rose-500 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" /> Enter available quantity
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            Product SKU
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. FS-PROD-001"
              className="w-full h-9 pl-3 pr-24 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => {
                if (!formData.name || !formData.name.trim()) {
                  alert(
                    "Please enter a Product Name first to auto-generate the SKU."
                  );
                  return;
                }
                handleGenerateSKU();
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded hover:bg-blue-100 transition-colors"
            >
              Auto Generate
            </button>
          </div>
        </div>

        {/* Barcode */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            Product Barcode
          </label>
          <input
            type="text"
            placeholder="e.g., BAR-123456"
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
            value={formData.barcode}
            onChange={(e) =>
              setFormData({ ...formData, barcode: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${formData.continue_selling
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-slate-300 bg-white"
            }`}
          onClick={() =>
            setFormData({
              ...formData,
              continue_selling: !formData.continue_selling,
            })
          }
        >
          {formData.continue_selling && (
            <Check className="w-3 h-3 stroke-[3]" />
          )}
        </button>
        <span className="text-xs font-semibold text-slate-600">
          Continue selling when out of stock
        </span>
      </div>
    </div>
  );
};
