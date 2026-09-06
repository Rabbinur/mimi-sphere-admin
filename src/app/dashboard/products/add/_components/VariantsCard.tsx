"use client";

import React from "react";
import {
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Ruler,
  X,
} from "lucide-react";

interface Variant {
  name: string;
  values: string[];
  guide_content?: string;
  guide_text?: string;
}

interface VariantCombination {
  label: string;
  price: string;
  discount: string;
  sku: string;
  qty: string;
  id?: number;
}

interface VariantsCardProps {
  variants: Variant[];
  setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
  showVariantForm: boolean;
  setShowVariantForm: (show: boolean) => void;
  editingVariantIndex: number | null;
  setEditingVariantIndex: (idx: number | null) => void;
  newVariantName: string;
  setNewVariantName: (name: string) => void;
  variantValueInputs: { [key: string]: string };
  setVariantValueInputs: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  addVariant: () => void;
  editVariant: (idx: number) => void;
  removeVariant: (idx: number) => void;
  addVariantValue: (variantIndex: number, valueStr: string) => void;
  removeVariantValue: (variantIndex: number, valueIndex: number) => void;
  setActiveGuideIndex: (idx: number | null) => void;
  setIsGuideModalOpen: (open: boolean) => void;
  variantCombinations: VariantCombination[];
  setVariantCombinations: React.Dispatch<
    React.SetStateAction<VariantCombination[]>
  >;
}

export const VariantsCard: React.FC<VariantsCardProps> = ({
  variants,
  setVariants,
  showVariantForm,
  setShowVariantForm,
  editingVariantIndex,
  setEditingVariantIndex,
  newVariantName,
  setNewVariantName,
  variantValueInputs,
  setVariantValueInputs,
  addVariant,
  editVariant,
  removeVariant,
  addVariantValue,
  removeVariantValue,
  setActiveGuideIndex,
  setIsGuideModalOpen,
  variantCombinations,
  setVariantCombinations,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-slate-800">
          Variants
        </h3>
      </div>

      <div className="space-y-2.5">
        {variants.map((variant, vIdx) => (
          <div
            key={vIdx}
            className="flex items-center justify-between p-3 bg-slate-50/80 rounded-lg border border-slate-200/80"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                {variant.name}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variant.values.map((val, valIdx) => (
                  <span
                    key={valIdx}
                    className="h-6 px-2 rounded-md border border-slate-200 bg-white text-slate-600 text-[11px] font-semibold flex items-center"
                  >
                    {val}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-600">
              <button
                type="button"
                onClick={() => {
                  const varItem = variants[vIdx];
                  if (!varItem.guide_text) {
                    const newVariants = [...variants];
                    newVariants[vIdx].guide_text = `${varItem.name} Guide`;
                    setVariants(newVariants);
                  }
                  setActiveGuideIndex(vIdx);
                  setIsGuideModalOpen(true);
                }}
                className={`hover:underline flex items-center gap-1 ${
                  variant.guide_content ? "text-emerald-600 font-bold" : ""
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                {variant.guide_content ? "Edit Guide" : "Add Guide"}
              </button>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={() => editVariant(vIdx)}
                className="hover:underline"
              >
                Edit
              </button>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={() => removeVariant(vIdx)}
                className="text-slate-500 hover:text-rose-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {showVariantForm && (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-800">
            {editingVariantIndex !== null && variants[editingVariantIndex]
              ? "Edit Variant"
              : "Add New Variant"}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-700">
                Variant Name<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Color"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-600 text-xs font-medium text-slate-800 transition-all"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVariant();
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-slate-700">
                Variant Values<span className="text-rose-500 ml-0.5">*</span>
              </label>
              <div className="min-h-[36px] p-1.5 rounded-lg border border-slate-200 bg-white flex flex-wrap gap-1.5 items-center focus-within:border-blue-600 transition-all">
                {editingVariantIndex !== null &&
                  variants[editingVariantIndex]?.values.map((val, valIdx) => (
                    <span
                      key={valIdx}
                      className="h-6 px-2 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      {val}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-rose-500"
                        onClick={() =>
                          removeVariantValue(editingVariantIndex, valIdx)
                        }
                      />
                    </span>
                  ))}
                <input
                  type="text"
                  placeholder="Enter value"
                  className="flex-1 min-w-[100px] h-full outline-none text-xs font-medium text-slate-800 ml-1"
                  value={
                    variantValueInputs[
                      editingVariantIndex !== null ? editingVariantIndex : "new"
                    ] || ""
                  }
                  onChange={(e) =>
                    setVariantValueInputs({
                      ...variantValueInputs,
                      [editingVariantIndex !== null
                        ? editingVariantIndex
                        : "new"]: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val =
                        variantValueInputs[
                          editingVariantIndex !== null
                            ? editingVariantIndex
                            : "new"
                        ] || "";
                      if (editingVariantIndex !== null) {
                        addVariantValue(editingVariantIndex, val);
                      } else {
                        if (newVariantName) {
                          const newIdx = variants.length;
                          setVariants([
                            ...variants,
                            {
                              name: newVariantName,
                              values: [val.trim()],
                              guide_content: "",
                              guide_text: "",
                            },
                          ]);
                          setEditingVariantIndex(newIdx);
                          setNewVariantName("");
                        }
                      }
                      setVariantValueInputs({
                        ...variantValueInputs,
                        [editingVariantIndex !== null
                          ? editingVariantIndex
                          : "new"]: "",
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setShowVariantForm(false);
                setEditingVariantIndex(null);
              }}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowVariantForm(false);
                setEditingVariantIndex(null);
              }}
              className="px-5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setShowVariantForm(!showVariantForm);
          setEditingVariantIndex(null);
          setNewVariantName("");
        }}
        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group pt-1"
      >
        <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center group-hover:bg-blue-50">
          <Plus className="w-2.5 h-2.5" />
        </div>
        Add Product Variant
      </button>

      {variantCombinations.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 rounded-lg mt-4">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase w-[50px]">
                  SL
                </th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase min-w-[160px]">
                  Variant
                </th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase">
                  Regular Price
                </th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase">
                  Discount Price
                </th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase">
                  SKU
                </th>
                <th className="px-4 py-2.5 text-[11px] font-bold text-slate-600 uppercase">
                  Available Qty
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {variantCombinations.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <span className="font-bold text-slate-800">
                        {item.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative w-[110px] group overflow-hidden border border-slate-200 rounded-md">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                        $
                      </span>
                      <input
                        type="text"
                        className="w-full h-8 pl-6 pr-6 outline-none text-xs font-medium text-slate-800"
                        value={item.price}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          const newCombos = [...variantCombinations];
                          newCombos[idx].price = val;
                          setVariantCombinations(newCombos);
                        }}
                      />
                      <div className="absolute right-0 top-0 h-full w-6 border-l border-slate-200 flex flex-col">
                        <div
                          className="flex-1 flex items-center justify-center border-b border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const current = parseFloat(item.price) || 0;
                            const newCombos = [...variantCombinations];
                            newCombos[idx].price = (current + 1).toString();
                            setVariantCombinations(newCombos);
                          }}
                        >
                          <ChevronRight className="-rotate-90 w-2.5 h-2.5 text-slate-400" />
                        </div>
                        <div
                          className="flex-1 flex items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const current = parseFloat(item.price) || 0;
                            if (current > 0) {
                              const newCombos = [...variantCombinations];
                              newCombos[idx].price = (current - 1).toString();
                              setVariantCombinations(newCombos);
                            }
                          }}
                        >
                          <ChevronRight className="rotate-90 w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative w-[110px] group overflow-hidden border border-slate-200 rounded-md">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                        $
                      </span>
                      <input
                        type="text"
                        className="w-full h-8 pl-6 pr-6 outline-none text-xs font-medium text-slate-800"
                        value={item.discount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, "");
                          const newCombos = [...variantCombinations];
                          newCombos[idx].discount = val;
                          setVariantCombinations(newCombos);
                        }}
                      />
                      <div className="absolute right-0 top-0 h-full w-6 border-l border-slate-200 flex flex-col">
                        <div
                          className="flex-1 flex items-center justify-center border-b border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const current = parseFloat(item.discount) || 0;
                            const newCombos = [...variantCombinations];
                            newCombos[idx].discount = (current + 1).toString();
                            setVariantCombinations(newCombos);
                          }}
                        >
                          <ChevronRight className="-rotate-90 w-2.5 h-2.5 text-slate-400" />
                        </div>
                        <div
                          className="flex-1 flex items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const current = parseFloat(item.discount) || 0;
                            if (current > 0) {
                              const newCombos = [...variantCombinations];
                              newCombos[idx].discount = (
                                current - 1
                              ).toString();
                              setVariantCombinations(newCombos);
                            }
                          }}
                        >
                          <ChevronRight className="rotate-90 w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      className="w-full h-8 px-3 rounded-md border border-slate-200 outline-none text-xs font-medium text-slate-800 focus:border-blue-600 transition-all"
                      value={item.sku}
                      onChange={(e) => {
                        const newCombos = [...variantCombinations];
                        newCombos[idx].sku = e.target.value;
                        setVariantCombinations(newCombos);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative w-[90px] group overflow-hidden border border-slate-200 rounded-md">
                      <input
                        type="text"
                        className="w-full h-8 pl-3 pr-6 text-xs font-medium text-slate-800 outline-none"
                        value={item.qty}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newCombos = [...variantCombinations];
                          newCombos[idx].qty = val || "0";
                          setVariantCombinations(newCombos);
                        }}
                      />
                      <div className="absolute right-0 top-0 h-full w-6 border-l border-slate-200 flex flex-col">
                        <div
                          className="flex-1 flex items-center justify-center border-b border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const current = parseInt(item.qty) || 0;
                            const newCombos = [...variantCombinations];
                            newCombos[idx].qty = (current + 1).toString();
                            setVariantCombinations(newCombos);
                          }}
                        >
                          <ChevronRight className="-rotate-90 w-2.5 h-2.5 text-slate-400" />
                        </div>
                        <div
                          className="flex-1 flex items-center justify-center bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const current = parseInt(item.qty) || 0;
                            if (current > 0) {
                              const newCombos = [...variantCombinations];
                              newCombos[idx].qty = (current - 1).toString();
                              setVariantCombinations(newCombos);
                            }
                          }}
                        >
                          <ChevronRight className="rotate-90 w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
