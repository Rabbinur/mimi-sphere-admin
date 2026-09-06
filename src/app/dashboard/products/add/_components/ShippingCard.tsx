"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface ShippingCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const ShippingCard: React.FC<ShippingCardProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-slate-800">
        Shipping
      </h3>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_physical"
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={formData.is_physical}
          onChange={(e) =>
            setFormData({ ...formData, is_physical: e.target.checked })
          }
        />
        <label
          htmlFor="is_physical"
          className="text-xs font-semibold text-slate-700 cursor-pointer"
        >
          This is a physical product
        </label>
      </div>

      {formData.is_physical && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-slate-700">
              Weight<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="flex group overflow-hidden border border-slate-200 rounded-lg">
              <input
                type="text"
                placeholder="0.0"
                className="flex-1 h-9 px-3 text-xs font-medium text-slate-800 outline-none"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
              <div className="w-16 h-9 border-l border-slate-200 bg-slate-50 flex items-center justify-center gap-1 cursor-pointer hover:bg-white transition-colors">
                <span className="text-[11px] font-bold text-slate-600 uppercase">
                  {formData.weight_unit}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Height */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-slate-700">
              Height
            </label>
            <div className="flex group overflow-hidden border border-slate-200 rounded-lg">
              <input
                type="text"
                placeholder="0.0"
                className="flex-1 h-9 px-3 text-xs font-medium text-slate-800 outline-none"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
              />
              <div className="w-16 h-9 border-l border-slate-200 bg-slate-50 flex items-center justify-center gap-1 cursor-pointer hover:bg-white transition-colors">
                <span className="text-[11px] font-bold text-slate-600 uppercase">
                  {formData.height_unit}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Width */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-slate-700">
              Width
            </label>
            <div className="flex group overflow-hidden border border-slate-200 rounded-lg">
              <input
                type="text"
                placeholder="0.0"
                className="flex-1 h-9 px-3 text-xs font-medium text-slate-800 outline-none"
                value={formData.width}
                onChange={(e) =>
                  setFormData({ ...formData, width: e.target.value })
                }
              />
              <div className="w-16 h-9 border-l border-slate-200 bg-slate-50 flex items-center justify-center gap-1 cursor-pointer hover:bg-white transition-colors">
                <span className="text-[11px] font-bold text-slate-600 uppercase">
                  {formData.width_unit}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
