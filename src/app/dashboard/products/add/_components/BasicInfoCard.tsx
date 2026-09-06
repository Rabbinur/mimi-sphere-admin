"use client";

import RichTextEditor from "@/components/ui/RichTextEditor";
import { ChevronDown, Search, Upload, X, Check } from "lucide-react";
import React, { useState } from "react";
import { CreateCategoryModal } from "./CreateCategoryModal";

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface BasicInfoCardProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  categories: Category[];
  filteredCategories: Category[];
  isCategoryOpen: boolean;
  setIsCategoryOpen: (open: boolean) => void;
  categorySearch: string;
  setCategorySearch: (search: string) => void;
  categoryRef: React.RefObject<HTMLDivElement | null>;
  brands: { id: number; name: string }[];
  isBrandOpen: boolean;
  setIsBrandOpen: (open: boolean) => void;
  brandSearch: string;
  setBrandSearch: (search: string) => void;
  brandRef: React.RefObject<HTMLDivElement | null>;
  images: { file: File | null; url: string; id?: number }[];
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  formData,
  setFormData,
  categories,
  filteredCategories,
  isCategoryOpen,
  setIsCategoryOpen,
  categorySearch,
  setCategorySearch,
  categoryRef,
  brands,
  isBrandOpen,
  setIsBrandOpen,
  brandSearch,
  setBrandSearch,
  brandRef,
  images,
  handleImageUpload,
  removeImage,
}) => {
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const handleCategoryCreated = (newCat: any) => {
    const catId = Number(newCat?.id);
    if (!isNaN(catId)) {
      let newIds = [...selectedCategoryIds];
      if (!newIds.includes(catId)) {
        newIds.push(catId);
      }
      setFormData({
        ...formData,
        category_ids: newIds,
        category_id: newIds.length > 0 ? newIds[0].toString() : "",
      });
    }
    setIsCreateCategoryOpen(false);
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    let flat: Category[] = [];
    cats.forEach((cat) => {
      flat.push(cat);
      if (cat.children) flat = [...flat, ...flattenCategories(cat.children)];
    });
    return flat;
  };

  const allFlatCategories = React.useMemo(() => flattenCategories(categories), [categories]);

  const selectedCategoryIds: number[] = React.useMemo(() => {
    if (Array.isArray(formData.category_ids)) {
      return formData.category_ids.map(Number);
    }
    return formData.category_id ? [Number(formData.category_id)] : [];
  }, [formData.category_id, formData.category_ids]);

  const selectedCategories = React.useMemo(() => {
    return allFlatCategories.filter((c) => selectedCategoryIds.includes(c.id));
  }, [allFlatCategories, selectedCategoryIds]);

  const handleToggleCategory = (catId: number) => {
    let newIds = [...selectedCategoryIds];
    if (newIds.includes(catId)) {
      newIds = newIds.filter((id) => id !== catId);
    } else {
      newIds.push(catId);
    }
    setFormData({
      ...formData,
      category_ids: newIds,
      category_id: newIds.length > 0 ? newIds[0].toString() : "",
    });
  };

  const handleRemoveCategory = (catId: number) => {
    const newIds = selectedCategoryIds.filter((id) => id !== catId);
    setFormData({
      ...formData,
      category_ids: newIds,
      category_id: newIds.length > 0 ? newIds[0].toString() : "",
    });
  };

  const renderCategoryTree = (cats: Category[], depth = 0) => {
    return cats.map((cat) => {
      const isSelected = selectedCategoryIds.includes(cat.id);
      return (
        <React.Fragment key={cat.id}>
          <div
            className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-2 ${
              isSelected ? "bg-blue-50/50" : ""
            }`}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
            onClick={() => handleToggleCategory(cat.id)}
          >
            {depth > 0 && <span className="mr-0.5 text-slate-300">|—</span>}
            {/* Custom Checkbox */}
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                isSelected 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : "border-slate-300 bg-white"
            }`}>
                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span className={`${isSelected ? "text-blue-600 font-bold" : "text-slate-700 font-medium"}`}>
              {cat.name}
            </span>
          </div>
          {cat.children &&
            cat.children.length > 0 &&
            renderCategoryTree(cat.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <h3 className="text-sm sm:text-base font-bold text-slate-800">
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[12px] font-semibold text-slate-700">
            Product Name<span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter product name"
            className="w-full h-9 px-3.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all"
            value={formData.name}
            onChange={(e) => {
              const val = e.target.value;
              const slug = val
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/[\s-]+/g, "-");
              setFormData({
                ...formData,
                name: val,
                url_handle: slug ? `products/${slug}` : "products/",
              });
            }}
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-semibold text-slate-700">
              Category<span className="text-rose-500 ml-0.5">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsCreateCategoryOpen(true)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5 cursor-pointer"
            >
              + Add New
            </button>
          </div>
          <div className="relative" ref={categoryRef}>
            <div
              className={`w-full min-h-[36px] p-1.5 rounded-lg border ${isCategoryOpen
                  ? "border-blue-600 ring-2 ring-blue-50"
                  : "border-slate-200"
                } bg-white flex flex-wrap items-center gap-1.5 cursor-pointer transition-all`}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              {selectedCategories.length === 0 ? (
                <span className="text-xs font-medium text-slate-400 px-2 py-0.5">
                  Choose product categories
                </span>
              ) : (
                selectedCategories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCategory(cat.id);
                    }}
                  >
                    {cat.name}
                    <X className="w-3 h-3 text-slate-500 hover:text-slate-700 cursor-pointer" />
                  </span>
                ))
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-auto shrink-0 mr-1.5" />
            </div>

            {isCategoryOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      className="w-full h-8 pl-8 pr-3 rounded-md border border-slate-200 bg-white text-xs font-medium outline-none focus:border-blue-600 transition-all"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-[220px] overflow-y-auto py-1 text-xs">
                  {filteredCategories.length > 0 ? (
                    renderCategoryTree(filteredCategories)
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-400">
                        No categories found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Brand Selector */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-slate-700">Brand</label>
          <div className="relative" ref={brandRef}>
            <div
              className={`w-full h-9 px-3.5 rounded-lg border ${isBrandOpen
                  ? "border-blue-600 ring-2 ring-blue-50"
                  : "border-slate-200"
                } bg-white flex items-center justify-between cursor-pointer transition-all`}
              onClick={() => setIsBrandOpen(!isBrandOpen)}
            >
              <span
                className={`text-xs font-medium ${formData.brand_id ? "text-slate-800" : "text-slate-400"
                  }`}
              >
                {brands.find((b) => b.id.toString() === formData.brand_id)
                  ?.name || "Choose product brand"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isBrandOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {isBrandOpen && (
              <div className="absolute top-10 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      className="w-full h-8 pl-8 pr-3 rounded-md border border-slate-200 bg-white text-xs font-medium outline-none focus:border-blue-600 transition-all"
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto py-1">
                  {brands.filter((b) =>
                    b.name.toLowerCase().includes(brandSearch.toLowerCase())
                  ).length > 0 ? (
                    brands
                      .filter((b) =>
                        b.name.toLowerCase().includes(brandSearch.toLowerCase())
                      )
                      .map((brand) => (
                        <div
                          key={brand.id}
                          className={`px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex items-center ${formData.brand_id === brand.id.toString()
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "text-slate-700 font-medium"
                            }`}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              brand_id: brand.id.toString(),
                            });
                            setIsBrandOpen(false);
                            setBrandSearch("");
                          }}
                        >
                          {brand.name}
                        </div>
                      ))
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <Search className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-400">
                        No brands found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-[12px] font-semibold text-slate-700">
          Description<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(content) =>
            setFormData({ ...formData, description: content })
          }
          placeholder="Write down product description"
        />
      </div>

      {/* Media Upload */}
      <div className="space-y-2 pt-1">
        <label className="text-[12px] font-semibold text-slate-700">
          Upload Media<span className="text-rose-500 ml-0.5">*</span>
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden group shadow-2xs bg-slate-50"
            >
              <img
                src={img.url}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full shadow-sm flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[9px] font-bold py-0.5 text-center">
                  Primary
                </div>
              )}
            </div>
          ))}
          <label className="relative aspect-square border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100/80 transition-colors">
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleImageUpload}
              accept="image/*"
            />
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-semibold text-slate-600">
              Add Image
            </span>
          </label>
        </div>
      </div>

      {/* Inline Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
};
