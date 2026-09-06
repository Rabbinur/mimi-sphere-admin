"use client";

import React from "react";
import { X } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface GuideContentModalProps {
  isGuideModalOpen: boolean;
  setIsGuideModalOpen: (open: boolean) => void;
  activeGuideIndex: number | null;
  variants: { name: string; values: string[]; guide_content?: string; guide_text?: string }[];
  setVariants: React.Dispatch<React.SetStateAction<any[]>>;
}

export const GuideContentModal: React.FC<GuideContentModalProps> = ({
  isGuideModalOpen,
  setIsGuideModalOpen,
  activeGuideIndex,
  variants,
  setVariants,
}) => {
  if (!isGuideModalOpen || activeGuideIndex === null || !variants[activeGuideIndex]) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10 gap-6">
          <div className="shrink-0">
            <h3 className="text-base font-bold text-slate-800">
              Edit Guide Content
            </h3>
            <p className="text-xs font-medium text-slate-500 truncate">
              Format details for {variants[activeGuideIndex].name}
            </p>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="relative">
              <input
                type="text"
                placeholder={`${variants[activeGuideIndex].name} Guide`}
                className="w-full h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
                value={variants[activeGuideIndex].guide_text || ""}
                onChange={(e) => {
                  const newVariants = [...variants];
                  newVariants[activeGuideIndex].guide_text = e.target.value;
                  setVariants(newVariants);
                }}
              />
              <span className="absolute -top-2 left-2 px-1 bg-white text-[9px] font-bold text-blue-600 uppercase tracking-wider">
                Button Text
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsGuideModalOpen(false)}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <RichTextEditor
            value={variants[activeGuideIndex].guide_content || ""}
            onChange={(content) => {
              const newVariants = [...variants];
              newVariants[activeGuideIndex].guide_content = content;
              setVariants(newVariants);
            }}
            placeholder="Enter size guide, instructions or any detail..."
          />
        </div>

        <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={() => setIsGuideModalOpen(false)}
            className="px-6 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
