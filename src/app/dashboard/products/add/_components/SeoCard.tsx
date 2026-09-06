"use client";

import React from "react";
import { HelpCircle, X } from "lucide-react";

interface SeoCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleGenerateSEO: () => void;
  seoTags: string[];
  tagInput: string;
  setTagInput: (input: string) => void;
  addSeoTag: (val: string) => void;
  removeSeoTag: (idx: number) => void;
}

export const SeoCard: React.FC<SeoCardProps> = ({
  formData,
  setFormData,
  handleGenerateSEO,
  seoTags,
  tagInput,
  setTagInput,
  addSeoTag,
  removeSeoTag,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            Product SEO Settings
          </h3>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
        </div>
        <button
          type="button"
          onClick={handleGenerateSEO}
          className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded hover:bg-blue-100 transition-colors"
        >
          Auto Generate SEO
        </button>
      </div>

      <div className="space-y-4">
        {/* Page Title */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-[12px] font-semibold text-slate-700">
              Page Title
            </label>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              {formData.seo_title.length}/70 max
            </span>
          </div>
          <input
            type="text"
            placeholder="Enter page title"
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
            value={formData.seo_title}
            onChange={(e) =>
              setFormData({ ...formData, seo_title: e.target.value })
            }
          />
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label className="text-[12px] font-semibold text-slate-700">
              Meta Description
            </label>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              {formData.seo_description.length}/160 max
            </span>
          </div>
          <textarea
            placeholder="Write down Meta description"
            className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
            value={formData.seo_description}
            onChange={(e) =>
              setFormData({ ...formData, seo_description: e.target.value })
            }
          />
        </div>

        {/* URL Handle */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">
            URL Handle
          </label>
          <div className="space-y-1">
            <input
              type="text"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
              value={formData.url_handle}
              onChange={(e) =>
                setFormData({ ...formData, url_handle: e.target.value })
              }
            />
            <p className="text-[10px] font-medium text-slate-400">
              https://www.goldenmarkstore.com/{formData.url_handle}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">Tags</label>
          <div className="min-h-[38px] p-1.5 rounded-lg border border-slate-200 bg-white flex flex-wrap gap-1.5 items-center focus-within:border-blue-600 transition-colors">
            {seoTags.map((tag, idx) => (
              <span
                key={idx}
                className="h-6 px-2.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5"
              >
                {tag}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-500"
                  onClick={() => removeSeoTag(idx)}
                />
              </span>
            ))}
            <input
              type="text"
              placeholder={seoTags.length === 0 ? "Enter tags..." : ""}
              className="flex-1 min-w-[100px] h-full outline-none text-xs font-medium text-slate-800 ml-1"
              value={tagInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val.endsWith(",") || val.endsWith(" ")) {
                  addSeoTag(val);
                } else {
                  setTagInput(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSeoTag(tagInput);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
