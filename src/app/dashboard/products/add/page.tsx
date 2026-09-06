"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

import { useAllBrandsQuery as useGetBrandsQuery } from "@/components/Redux/RTK/brandApi";
import { useAllCategoryQuery as useGetCategoryTreeQuery } from "@/components/Redux/RTK/categoryApi";
import { useCreateProductMutation } from "@/components/Redux/RTK/productApi";

import { BasicInfoCard } from "./_components/BasicInfoCard";
import { GuideContentModal } from "./_components/GuideContentModal";
import { InventoryCard } from "./_components/InventoryCard";
import { PoliciesCard } from "./_components/PoliciesCard";
import { PricingDetailsCard } from "./_components/PricingDetailsCard";
import { SeoCard } from "./_components/SeoCard";
import { ShippingCard } from "./_components/ShippingCard";
import { VariantsCard } from "./_components/VariantsCard";

interface Category {
    id: number;
    name: string;
    children?: Category[];
}

export default function AddProductPage() {
    const router = useRouter();

    // RTK Query Hooks
    const { data: categoryTreeRes } = useGetCategoryTreeQuery();
    const { data: brandsRes } = useGetBrandsQuery({ per_page: 100 });
    const [createProduct, { isLoading: isSubmitting }] = useCreateProductMutation();

    const categories: Category[] = categoryTreeRes?.data || [];
    const brands: { id: number; name: string }[] =
        brandsRes?.data?.data || brandsRes?.data || [];

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        category_ids: [] as number[],
        brand_id: "",
        description: "",
        price: "",
        sale_price: "",
        cost_per_item: "",
        charge_tax: true,
        quantity: "0",
        sku: "",
        barcode: "",
        continue_selling: false,
        is_physical: true,
        weight: "",
        weight_unit: "kg",
        height: "",
        height_unit: "ft",
        width: "",
        width_unit: "ft",
        seo_title: "",
        seo_description: "",
        url_handle: "products/",
        shipping_policy: "",
        return_policy: "",
    });

    // Dynamic feature state
    const [images, setImages] = useState<{ file: File | null; url: string }[]>([]);
    const [variants, setVariants] = useState<
        { name: string; values: string[]; guide_content?: string; guide_text?: string }[]
    >([]);
    const [seoTags, setSeoTags] = useState<string[]>([]);
    const [newVariantName, setNewVariantName] = useState("");
    const [variantValueInputs, setVariantValueInputs] = useState<{ [key: string]: string }>({});
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
    const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
    const [activeGuideIndex, setActiveGuideIndex] = useState<number | null>(null);
    const [variantCombinations, setVariantCombinations] = useState<
        { label: string; price: string; discount: string; sku: string; qty: string }[]
    >([]);
    const [tagInput, setTagInput] = useState("");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");
    const [isBrandOpen, setIsBrandOpen] = useState(false);
    const [brandSearch, setBrandSearch] = useState("");
    const categoryRef = useRef<HTMLDivElement>(null);
    const brandRef = useRef<HTMLDivElement>(null);

    // Cartesian product generator for variants
    useEffect(() => {
        const activeVariants = variants.filter((v) => v.values.length > 0);

        if (activeVariants.length === 0) {
            setVariantCombinations([]);
            return;
        }

        const generate = (index: number, current: string[]): string[][] => {
            if (index === activeVariants.length) return [current];
            const results: string[][] = [];
            for (const val of activeVariants[index].values) {
                results.push(...generate(index + 1, [...current, val]));
            }
            return results;
        };

        const combinations = generate(0, []);
        setVariantCombinations((prev) =>
            combinations.map((combo) => {
                const label = combo.join(" / ");
                const existing = prev.find((p) => p.label === label);

                if (existing) return existing;

                return {
                    label,
                    price: formData.price || "0",
                    discount: formData.sale_price || "",
                    sku: formData.sku
                        ? `${formData.sku}-${combo
                            .map((c) => String(c).replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
                            .join("-")}`
                        : "",
                    qty: "0",
                };
            })
        );
    }, [variants, formData.price, formData.sale_price, formData.sku]);

    // Auto-calculate total quantity based on variant quantities
    useEffect(() => {
        if (variantCombinations.length > 0) {
            const totalQty = variantCombinations.reduce(
                (sum, item) => sum + (parseInt(item.qty) || 0),
                0
            );
            setFormData((prev) => ({
                ...prev,
                quantity: totalQty.toString(),
            }));
        }
    }, [variantCombinations]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newImages = Array.from(files).map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const filtered = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index].url);
            return filtered;
        });
    };

    const addVariant = () => {
        if (!newVariantName) return;
        if (editingVariantIndex !== null) {
            const newVariants = [...variants];
            newVariants[editingVariantIndex] = {
                ...newVariants[editingVariantIndex],
                name: newVariantName,
            };
            setVariants(newVariants);
            setEditingVariantIndex(null);
        } else {
            setVariants([
                ...variants,
                { name: newVariantName, values: [], guide_content: "", guide_text: "" },
            ]);
            setEditingVariantIndex(variants.length);
        }
        setNewVariantName("");
    };

    const editVariant = (index: number) => {
        setEditingVariantIndex(index);
        setNewVariantName(variants[index].name);
        setShowVariantForm(true);
    };

    const addVariantValue = (variantIndex: number, value: string) => {
        if (!value.trim()) return;
        const newVariants = [...variants];
        if (!newVariants[variantIndex].values.includes(value.trim())) {
            newVariants[variantIndex].values.push(value.trim());
            setVariants(newVariants);
        }
    };

    const removeVariantValue = (variantIndex: number, valueIdx: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values.splice(valueIdx, 1);
        setVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleGenerateSKU = () => {
        if (!formData.name) return;
        const prefix = "FS";
        const namePart = formData.name
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .split(" ")
            .filter((w) => w.length > 0)
            .map((w) => w.substring(0, 3).toUpperCase())
            .join("");
        setFormData({
            ...formData,
            sku: `${prefix}-${namePart.substring(0, 10)}`,
        });
    };

    const handleGenerateSEO = () => {
        if (!formData.name) {
            alert("Please enter a Product Name first to generate SEO data.");
            return;
        }

        const catName =
            selectedCategoryName !== "Choose product category"
                ? selectedCategoryName
                : "Products";

        const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

        const titleTemplates = [
            `Buy ${formData.name} | Premium ${catName} - GoldenMark Store`,
            `Shop ${formData.name} - Best ${catName} | GoldenMark Store`,
            `${formData.name} Online: Exclusive ${catName} Deals`,
            `Get the ${formData.name} | Top-Rated ${catName}`,
            `Authentic ${formData.name} | GoldenMark Store ${catName}`,
        ];

        const strippedDesc = formData.description.replace(/<[^>]+>/g, "").trim();
        let descTemplates: string[] = [];

        if (strippedDesc.length > 30) {
            const shortDesc = strippedDesc.substring(0, 80).trim();
            descTemplates = [
                `Discover ${formData.name}. ${shortDesc}... Shop the best ${catName.toLowerCase()} online at GoldenMark Store with fast delivery!`,
                `Looking for quality? Get the ${formData.name}. ${shortDesc}... Explore our top ${catName.toLowerCase()} collection today.`,
                `Check out the ${formData.name}! ${shortDesc}... Buy premium ${catName.toLowerCase()} online with secure checkout and fast delivery.`,
            ];
        } else {
            descTemplates = [
                `Looking for ${formData.name}? Explore our premium collection of ${catName.toLowerCase()}. Enjoy exclusive deals, secure payment, and fast delivery at GoldenMark Store. Shop now!`,
                `Buy the latest ${formData.name} at GoldenMark Store. We offer the best ${catName.toLowerCase()} online. Don't miss out on top-quality products with quick shipping.`,
                `Shop ${formData.name} today! GoldenMark Store brings you the finest ${catName.toLowerCase()} with unmatched quality. Order now for safe checkout and fast home delivery.`,
            ];
        }

        const baseTags = [
            catName,
            `buy ${formData.name.toLowerCase()}`,
            `best ${catName.toLowerCase()}`,
            `${catName.toLowerCase()} online`,
            `shop ${formData.name.toLowerCase()}`,
        ];

        const ignoreWords = [
            "with",
            "this",
            "that",
            "from",
            "best",
            "premium",
            "quality",
            "shop",
            "online",
        ];
        const words = formData.name
            .split(" ")
            .filter((w) => w.length > 3 && !ignoreWords.includes(w.toLowerCase()));
        words.forEach((w) => baseTags.push(w));

        const uniqueTags = Array.from(new Set(baseTags.map((t) => t.trim()))).filter(
            (t) => t
        );

        const newTitle = getRandom(titleTemplates);
        const newDesc = getRandom(descTemplates);

        setFormData({
            ...formData,
            seo_title: newTitle.substring(0, 70),
            seo_description: newDesc.substring(0, 160),
        });

        const combinedTags = Array.from(
            new Set([...seoTags, ...uniqueTags])
        ).slice(0, 15);
        setSeoTags(combinedTags);
    };

    const addSeoTag = (tag: string) => {
        const cleanTag = tag.trim().replace(/,$/, "");
        if (cleanTag && !seoTags.includes(cleanTag)) {
            setSeoTags([...seoTags, cleanTag]);
        }
        setTagInput("");
    };

    const removeSeoTag = (index: number) => {
        setSeoTags(seoTags.filter((_, i) => i !== index));
    };

    const flattenCategories = (cats: Category[]): Category[] => {
        let flat: Category[] = [];
        cats.forEach((cat) => {
            flat.push(cat);
            if (cat.children) flat = [...flat, ...flattenCategories(cat.children)];
        });
        return flat;
    };

    const allFlatCategories = flattenCategories(categories);
    const selectedCategoryName =
        allFlatCategories.find((c) => c.id.toString() === formData.category_id)
            ?.name || "Choose product category";

    const filterCategories = (cats: Category[], term: string): Category[] => {
        if (!term) return cats;
        return cats
            .map((cat) => {
                const matches = cat.name.toLowerCase().includes(term.toLowerCase());
                const filteredChildren = cat.children
                    ? filterCategories(cat.children, term)
                    : [];
                if (matches || filteredChildren.length > 0) {
                    return { ...cat, children: filteredChildren };
                }
                return null;
            })
            .filter((cat) => cat !== null) as Category[];
    };

    const filteredCategories = filterCategories(categories, categorySearch);



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                categoryRef.current &&
                !categoryRef.current.contains(event.target as Node)
            ) {
                setIsCategoryOpen(false);
            }
            if (
                brandRef.current &&
                !brandRef.current.contains(event.target as Node)
            ) {
                setIsBrandOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = async (
        e: React.FormEvent,
        status: "published" | "draft" = "published"
    ) => {
        e.preventDefault();

        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === "category_ids") {
                    if (Array.isArray(value)) {
                        value.forEach((id) => {
                            data.append("category_ids[]", id.toString());
                        });
                    }
                } else if (typeof value === "boolean") {
                    data.append(key, value ? "1" : "0");
                } else {
                    data.append(key, value.toString());
                }
            });

            data.append("status", status);

            images.forEach((img, i) => {
                if (img.file) data.append(`images[${i}]`, img.file);
            });

            variantCombinations.forEach((item, i) => {
                data.append(`variant_combinations[${i}][label]`, item.label);
                data.append(`variant_combinations[${i}][price]`, item.price);
                data.append(`variant_combinations[${i}][discount_price]`, item.discount);
                data.append(`variant_combinations[${i}][sku]`, item.sku);
                data.append(`variant_combinations[${i}][qty]`, item.qty);
            });

            data.append("variant_options", JSON.stringify(variants));

            seoTags.forEach((tag, i) => {
                data.append(`tags[${i}]`, tag);
            });

            const result = await createProduct(data).unwrap();

            if (
                result.isError === false ||
                result.status === "success" ||
                result.Message === "Success" ||
                result.message === "Success"
            ) {
                router.push("/products");
            } else {
                alert(result.Message || result.message || "Failed to save product.");
            }
        } catch (error: any) {
            console.error("Failed to save product:", error);
            alert(
                error?.data?.message ||
                error?.message ||
                "An error occurred while saving the product."
            );
        }
    };

    return (
        <>
            <div className="max-w-full mx-auto pb-12 pt-2 px-3 sm:px-6 space-y-4">
                {/* Header Area */}
                <div className="flex items-center justify-between py-1 border-b border-slate-100 mb-2">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        Add Product
                    </h1>
                </div>

                <form className="space-y-4" onSubmit={(e) => handleSubmit(e, "published")}>
                    {/* Basic Information Card */}
                    <BasicInfoCard
                        formData={formData}
                        setFormData={setFormData}
                        categories={categories}
                        filteredCategories={filteredCategories}
                        isCategoryOpen={isCategoryOpen}
                        setIsCategoryOpen={setIsCategoryOpen}
                        categorySearch={categorySearch}
                        setCategorySearch={setCategorySearch}
                        categoryRef={categoryRef}
                        brands={brands}
                        isBrandOpen={isBrandOpen}
                        setIsBrandOpen={setIsBrandOpen}
                        brandSearch={brandSearch}
                        setBrandSearch={setBrandSearch}
                        brandRef={brandRef}
                        images={images}
                        handleImageUpload={handleImageUpload}
                        removeImage={removeImage}
                    />

                    {/* Pricing Details Card */}
                    <PricingDetailsCard formData={formData} setFormData={setFormData} />

                    {/* Inventory & SKU Card */}
                    <InventoryCard
                        formData={formData}
                        setFormData={setFormData}
                        variantCombinations={variantCombinations}
                        handleGenerateSKU={handleGenerateSKU}
                    />

                    {/* Variants Card */}
                    <VariantsCard
                        variants={variants}
                        setVariants={setVariants}
                        showVariantForm={showVariantForm}
                        setShowVariantForm={setShowVariantForm}
                        editingVariantIndex={editingVariantIndex}
                        setEditingVariantIndex={setEditingVariantIndex}
                        newVariantName={newVariantName}
                        setNewVariantName={setNewVariantName}
                        variantValueInputs={variantValueInputs}
                        setVariantValueInputs={setVariantValueInputs}
                        addVariant={addVariant}
                        editVariant={editVariant}
                        removeVariant={removeVariant}
                        addVariantValue={addVariantValue}
                        removeVariantValue={removeVariantValue}
                        setActiveGuideIndex={setActiveGuideIndex}
                        setIsGuideModalOpen={setIsGuideModalOpen}
                        variantCombinations={variantCombinations}
                        setVariantCombinations={setVariantCombinations}
                    />

                    {/* Shipping Card */}
                    <ShippingCard formData={formData} setFormData={setFormData} />

                    {/* Policies Card */}
                    <PoliciesCard formData={formData} setFormData={setFormData} />

                    {/* SEO Settings Card */}
                    <SeoCard
                        formData={formData}
                        setFormData={setFormData}
                        handleGenerateSEO={handleGenerateSEO}
                        seoTags={seoTags}
                        tagInput={tagInput}
                        setTagInput={setTagInput}
                        addSeoTag={addSeoTag}
                        removeSeoTag={removeSeoTag}
                    />

                    {/* Action Bar Footer */}
                    <div className="flex sm:flex-row flex-col items-center justify-end gap-3 p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                        <Link
                            href="/products"
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors order-last sm:order-first"
                        >
                            Cancel
                        </Link>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={(e) => handleSubmit(e, "draft")}
                            className="w-full sm:w-auto px-5 py-2 rounded-lg border border-blue-600 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                        >
                            Save to Draft
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting || !formData.name}
                            onClick={(e) => handleSubmit(e, "published")}
                            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Add Product"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Guide Content Modal */}
            <GuideContentModal
                isGuideModalOpen={isGuideModalOpen}
                setIsGuideModalOpen={setIsGuideModalOpen}
                activeGuideIndex={activeGuideIndex}
                variants={variants}
                setVariants={setVariants}
            />
        </>
    );
}
