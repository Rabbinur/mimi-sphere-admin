"use client";

import React from "react";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface PoliciesCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const PoliciesCard: React.FC<PoliciesCardProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-slate-800">
        Shipping & Return Policies
      </h3>

      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-slate-700">
          Shipping Policy
        </label>
        <RichTextEditor
          value={formData.shipping_policy}
          onChange={(content) =>
            setFormData({ ...formData, shipping_policy: content })
          }
          placeholder="Enter specific shipping policy for this product..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-slate-700">
          Return & Refund Policy
        </label>
        <RichTextEditor
          value={formData.return_policy}
          onChange={(content) =>
            setFormData({ ...formData, return_policy: content })
          }
          placeholder="Enter specific return and refund policy for this product..."
        />
      </div>
      <p className="text-[11px] font-medium text-slate-400">
        Note: If left empty, the global policies defined in Settings will be used.
      </p>
    </div>
  );
};
