"use client";

import { Check } from "lucide-react";
import React from "react";

interface PricingDetailsCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const PricingDetailsCard: React.FC<PricingDetailsCardProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-slate-800">
        Pricing Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            Regular Price<span className="text-rose-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              $
            </span>
            <input
              type="text"
              placeholder="0.00"
              className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            Sale Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              $
            </span>
            <input
              type="text"
              placeholder="0.00"
              className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
              value={formData.sale_price}
              onChange={(e) =>
                setFormData({ ...formData, sale_price: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            Cost per Item
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
              $
            </span>
            <input
              type="text"
              placeholder="0.00"
              className="w-full h-9 pl-7 pr-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
              value={formData.cost_per_item}
              onChange={(e) =>
                setFormData({ ...formData, cost_per_item: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${formData.charge_tax
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-slate-300 bg-white"
            }`}
          onClick={() =>
            setFormData({ ...formData, charge_tax: !formData.charge_tax })
          }
        >
          {formData.charge_tax && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
        <span className="text-xs font-semibold text-slate-600">
          Charge tax for this product
        </span>
      </div>
    </div>
  );
};
