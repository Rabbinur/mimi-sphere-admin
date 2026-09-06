"use client";

import { useAllBrandsQuery } from "@/components/Redux/RTK/brandApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import {
    useCreateCollectionMutation,
    useSingleCollectionQuery,
    useUpdateCollectionMutation,
} from "@/components/Redux/RTK/collectionApi";
import { useAllProductsQuery } from "@/components/Redux/RTK/productApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaFile, MediaLibrary } from "@/components/ui/media-manager";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Loader2, Plus, Save, Search, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const Editor = dynamic(() => import("@tinymce/tinymce-react").then(mod => mod.Editor), { ssr: false });

interface TFaq {
    question: string;
    answer: string;
}

interface TCollection {
    _id: string;
    name: string;
    slug: string;
    isActive?: boolean;
    displayOrder?: number;
    heroTitle?: string;
    heroDescription?: string;
    bannerImage?: string;
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogImage?: string;
    productSelectionMode: "manual" | "automatic";
    manualProducts?: any[];
    automaticFilters?: {
        brands?: string[];
        categories?: any[];
        tags?: string[];
    };
    FAQs?: TFaq[];
}

interface CollectionFormProps {
    mode: "create" | "edit";
    collectionId?: string;
}

export default function CollectionForm({ mode, collectionId }: CollectionFormProps) {
    const router = useRouter();
    const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();
    const [updateCollection, { isLoading: updating }] = useUpdateCollectionMutation();

    // Fetch full collection details if editing
    const { data: loadedCollection, isLoading: loadingCollection } = useSingleCollectionQuery(collectionId!, {
        skip: mode !== "edit" || !collectionId,
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Form States
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [displayOrder, setDisplayOrder] = useState(0);

    // Content CMS States
    const [heroTitle, setHeroTitle] = useState("");
    const [heroDescription, setHeroDescription] = useState("");
    const [bannerImage, setBannerImage] = useState("");
    const [content, setContent] = useState("");

    // SEO States
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [ogImage, setOgImage] = useState("");

    // Product Selection States
    const [selectionMode, setSelectionMode] = useState<"manual" | "automatic">("manual");
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // Automatic Filters States
    const [filterBrands, setFilterBrands] = useState<string[]>([]);
    const [filterCategories, setFilterCategories] = useState<string[]>([]);
    const [filterTags, setFilterTags] = useState<string[]>([]);
    const [newTagInput, setNewTagInput] = useState("");

    // FAQs States
    const [faqs, setFaqs] = useState<TFaq[]>([]);

    // JSON Import States
    const [importOpen, setImportOpen] = useState(false);
    const [importJsonText, setImportJsonText] = useState("");

    // Fetch lists for filters / selection
    const { data: productsData } = useAllProductsQuery(
        { searchTerm: productSearch, limit: 8 }
    );
    const { data: brandsRes } = useAllBrandsQuery({ limit: 100 });
    const { data: categoriesRes } = useAllCategoryQuery(undefined);

    const allBrands = brandsRes?.data?.brands || [];
    const allCategories = categoriesRes?.data || [];
    const searchedProducts = productsData?.data?.products || [];

    // Load initial values
    useEffect(() => {
        if (mode === "edit" && loadedCollection) {
            setName(loadedCollection.name || "");
            setIsActive(loadedCollection.isActive ?? true);
            setDisplayOrder(loadedCollection.displayOrder || 0);

            setHeroTitle(loadedCollection.heroTitle || "");
            setHeroDescription(loadedCollection.heroDescription || "");
            setBannerImage(loadedCollection.bannerImage || "");
            setContent(loadedCollection.content || "");

            setMetaTitle(loadedCollection.metaTitle || "");
            setMetaDescription(loadedCollection.metaDescription || "");
            setMetaKeywords(loadedCollection.metaKeywords || "");
            setOgImage(loadedCollection.ogImage || "");

            setSelectionMode(loadedCollection.productSelectionMode || "manual");
            setSelectedProducts(loadedCollection.manualProducts || []);

            const filters = loadedCollection.automaticFilters || {};
            setFilterBrands(filters.brands || []);
            setFilterCategories(
                (filters.categories || []).map((c: any) => (typeof c === "string" ? c : c._id || c))
            );
            setFilterTags(filters.tags || []);

            setFaqs(loadedCollection.FAQs || []);
        } else if (mode === "create") {
            setName("");
            setIsActive(true);
            setDisplayOrder(0);

            setHeroTitle("");
            setHeroDescription("");
            setBannerImage("");
            setContent("");

            setMetaTitle("");
            setMetaDescription("");
            setMetaKeywords("");
            setOgImage("");

            setSelectionMode("manual");
            setSelectedProducts([]);
            setFilterBrands([]);
            setFilterCategories([]);
            setFilterTags([]);

            setFaqs([]);
        }
    }, [mode, loadedCollection]);

    // File Import handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setImportJsonText(text);
        };
        reader.readAsText(file);
    };

    const handleImportJson = () => {
        try {
            const parsed = JSON.parse(importJsonText);
            if (!parsed || typeof parsed !== "object") {
                toast.error("Invalid JSON format");
                return;
            }

            if (mode === "create" && parsed.name) setName(parsed.name);
            if (typeof parsed.isActive === "boolean") setIsActive(parsed.isActive);
            if (typeof parsed.displayOrder === "number") setDisplayOrder(parsed.displayOrder);
            else if (typeof parsed.order === "number") setDisplayOrder(parsed.order);

            if (parsed.heroTitle) setHeroTitle(parsed.heroTitle);
            if (parsed.heroDescription) setHeroDescription(parsed.heroDescription);
            if (parsed.bannerImage) setBannerImage(parsed.bannerImage);
            if (parsed.content) setContent(parsed.content);

            if (parsed.metaTitle) setMetaTitle(parsed.metaTitle);
            if (parsed.metaDescription) setMetaDescription(parsed.metaDescription);
            if (parsed.metaKeywords) setMetaKeywords(parsed.metaKeywords);
            if (parsed.ogImage) setOgImage(parsed.ogImage);

            if (parsed.productSelectionMode) setSelectionMode(parsed.productSelectionMode);
            if (Array.isArray(parsed.FAQs)) setFaqs(parsed.FAQs);

            toast.success("JSON data imported successfully!");
            setImportOpen(false);
            setImportJsonText("");
        } catch (error) {
            toast.error("Failed to parse JSON. Please check formatting.");
        }
    };

    // FAQ Handlers
    const addFaq = () => {
        setFaqs([...faqs, { question: "", answer: "" }]);
    };

    const updateFaq = (index: number, key: "question" | "answer", value: string) => {
        const updated = [...faqs];
        updated[index] = { ...updated[index], [key]: value };
        setFaqs(updated);
    };

    const removeFaq = (index: number) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    // Product Selection Handlers
    const handleAddProduct = (product: any) => {
        if (!selectedProducts.find((p) => p._id === product._id)) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handleRemoveProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter((p) => p._id !== productId));
    };

    // Auto-Filter Handlers
    const toggleBrandFilter = (brandName: string) => {
        if (filterBrands.includes(brandName)) {
            setFilterBrands(filterBrands.filter((b) => b !== brandName));
        } else {
            setFilterBrands([...filterBrands, brandName]);
        }
    };

    const toggleCategoryFilter = (catId: string) => {
        if (filterCategories.includes(catId)) {
            setFilterCategories(filterCategories.filter((c) => c !== catId));
        } else {
            setFilterCategories([...filterCategories, catId]);
        }
    };

    const addTagFilter = () => {
        const cleanTag = newTagInput.trim();
        if (cleanTag && !filterTags.includes(cleanTag)) {
            setFilterTags([...filterTags, cleanTag]);
            setNewTagInput("");
        }
    };

    const removeTagFilter = (tag: string) => {
        setFilterTags(filterTags.filter((t) => t !== tag));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const payload = {
            name: name.trim(),
            isActive,
            displayOrder: Number(displayOrder),
            heroTitle: heroTitle.trim() || undefined,
            heroDescription: heroDescription.trim() || undefined,
            bannerImage: bannerImage || undefined,
            content: content || undefined,
            metaTitle: metaTitle.trim() || undefined,
            metaDescription: metaDescription.trim() || undefined,
            metaKeywords: metaKeywords.trim() || undefined,
            ogImage: ogImage || undefined,
            productSelectionMode: selectionMode,
            manualProducts: selectionMode === "manual" ? selectedProducts.map((p) => p._id) : [],
            automaticFilters: selectionMode === "automatic" ? {
                brands: filterBrands,
                categories: filterCategories,
                tags: filterTags,
            } : undefined,
            FAQs: faqs,
        };

        try {
            let res;
            if (mode === "create") {
                res = await createCollection(payload).unwrap();
                if (res.success || res.statusCode === 201) {
                    toast.success(res.message || "Collection created successfully");
                } else {
                    toast.error(res.message || "Failed to create collection");
                    return;
                }
            } else if (mode === "edit" && collectionId) {
                res = await updateCollection({
                    id: collectionId,
                    data: payload,
                }).unwrap();
                if (res.success || res.statusCode === 200) {
                    toast.success(res.message || "Collection updated successfully");
                } else {
                    toast.error(res.message || "Failed to update collection");
                    return;
                }
            }

            router.push("/dashboard/collections");
        } catch (err: any) {
            toast.error(err?.data?.message || "Operation failed");
        }
    };

    if (!mounted || loadingCollection) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/collections" className="rounded-md p-1 hover:bg-muted transition">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-slate-900">
                                {mode === "create" ? "Create Collection Page" : `Edit Collection Page: ${name}`}
                            </h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={importOpen} onOpenChange={setImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" type="button" className="gap-2">
                                    Import JSON
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] bg-white">
                                <DialogHeader>
                                    <DialogTitle>Import Collection JSON Data</DialogTitle>
                                    <p className="text-sm text-gray-500">
                                        Upload a .json file or paste raw JSON below to populate the form fields.
                                    </p>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    {/* AI Prompt Generator */}
                                    <div className="bg-slate-50 border rounded-lg p-3 text-xs space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-slate-700">AI Prompt Generator</span>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-[10px] bg-white hover:bg-slate-50"
                                                onClick={() => {
                                                    const promptText = `Generate a valid JSON object for the collection "${name || "[Collection Name]"}" with full CMS content. The output MUST be strictly valid JSON without any markdown code blocks, backticks, or extra explanation. Use this exact schema structure:
{
  "name": "${name || "[Collection Name]"}",
  "isActive": true,
  "displayOrder": 1,
  "heroTitle": "Summer Skincare Essentials",
  "heroDescription": "Discover our curated list of lightweight, hydrating skincare solutions perfect for hot summer days.",
  "bannerImage": "https://example.com/banner.jpg",
  "content": "<p>Introduce your summer skincare routine with our selection of sun protection, toners, and moisturizers...</p>",
  "metaTitle": "Summer Skincare Collection | Mimi Sphere",
  "metaDescription": "Shop top summer skincare essentials. Find lightweight moisturizers, hydrating sheet masks, and broad spectrum sunscreens.",
  "metaKeywords": "summer skincare, hydrating skincare, sun gel, soothing mist, k-beauty",
  "ogImage": "https://example.com/og.jpg",
  "productSelectionMode": "manual",
  "FAQs": [
    {
      "question": "What products are included in this collection?",
      "answer": "This collection features lightweight, non-greasy products designed specifically to hydrate and protect the skin during summer."
    }
  ]
}`;
                                                    navigator.clipboard.writeText(promptText);
                                                    toast.success("AI Prompt copied to clipboard!");
                                                }}
                                            >
                                                Copy Prompt
                                            </Button>
                                        </div>
                                        <p className="text-slate-500 text-[10px]">
                                            Copy this prompt and paste it into ChatGPT/Gemini to write the collection CMS JSON for you!
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload JSON File</Label>
                                        <Input type="file" accept=".json" onChange={handleFileChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Paste JSON Text</Label>
                                        <Textarea
                                            value={importJsonText}
                                            onChange={(e) => setImportJsonText(e.target.value)}
                                            placeholder='{ "name": "Summer Specials", "heroTitle": "Summer Skincare", ... }'
                                            rows={8}
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setImportOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="button" onClick={handleImportJson}>
                                        Apply Import
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={() => handleSubmit()} disabled={creating || updating} className="gap-2">
                            <Save className="h-4 w-4" />
                            {mode === "create" ? (creating ? "Creating..." : "Save") : (updating ? "Saving..." : "Save Changes")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Form Body */}
            <div className="container mx-auto  px-4 py-8 lg:px-8">
                <Tabs defaultValue="basic" className="w-full space-y-6">
                    <TabsList className="grid grid-cols-6 bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="content">Content</TabsTrigger>
                        <TabsTrigger value="seo">SEO</TabsTrigger>
                        <TabsTrigger value="products">Products Selection</TabsTrigger>
                        <TabsTrigger value="faq">FAQ</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Basic Tab */}
                    <TabsContent value="basic" className="space-y-6 rounded-xl border p-6 bg-white shadow-sm outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="collection-name">Collection Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="collection-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Summer Skincare Specials"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active Status</Label>
                                <div className="text-sm text-muted-foreground">Show or hide this collection page across the site</div>
                            </div>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </div>
                    </TabsContent>

                    {/* Content Tab */}
                    <TabsContent value="content" className="space-y-6 rounded-xl border p-6 bg-white shadow-sm outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="hero-title">Hero Title</Label>
                            <Input
                                id="hero-title"
                                value={heroTitle}
                                onChange={(e) => setHeroTitle(e.target.value)}
                                placeholder="e.g. Glowing Skin Essentials"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero-desc">Hero Description</Label>
                            <Textarea
                                id="hero-desc"
                                value={heroDescription}
                                onChange={(e) => setHeroDescription(e.target.value)}
                                placeholder="Engaging description for this specific collection..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label className="mb-1">Banner Image</Label>
                            <MediaLibrary
                                onSelect={(files: MediaFile[]) => {
                                    if (files.length > 0) setBannerImage(files[0].url);
                                }}
                                multiple={false}
                                title="Select Banner Image"
                            />
                            {bannerImage && (
                                <div className="mt-4 relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50 max-w-xl">
                                    <img src={bannerImage} alt="Banner preview" className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                        onClick={() => setBannerImage("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Page content (Rich Text)</Label>
                            <div className="border rounded-md overflow-hidden">
                                <Editor
                                    apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                                    value={content}
                                    init={{
                                        height: 350,
                                        menubar: false,
                                        plugins: [
                                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                        ],
                                        toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                    }}
                                    onEditorChange={(newContent) => setContent(newContent)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    {/* SEO Tab */}
                    <TabsContent value="seo" className="space-y-6 rounded-xl border p-6 bg-white shadow-sm outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="meta-title">Meta Title</Label>
                            <Input
                                id="meta-title"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="SEO Meta Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta-desc">Meta Description</Label>
                            <Textarea
                                id="meta-desc"
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="SEO Meta Description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta-keys">Meta Keywords</Label>
                            <Input
                                id="meta-keys"
                                value={metaKeywords}
                                onChange={(e) => setMetaKeywords(e.target.value)}
                                placeholder="keywords, separated, by, commas"
                            />
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label className="mb-1">OG Image</Label>
                            <MediaLibrary
                                onSelect={(files: MediaFile[]) => {
                                    if (files.length > 0) setOgImage(files[0].url);
                                }}
                                multiple={false}
                                title="Select OG Image"
                            />
                            {ogImage && (
                                <div className="mt-4 relative w-64 h-36 border rounded-lg overflow-hidden bg-gray-50">
                                    <img src={ogImage} alt="OG preview" className="w-full h-full object-cover" />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                        onClick={() => setOgImage("")}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Product Selection Tab */}
                    <TabsContent value="products" className="space-y-6 rounded-xl border p-6 bg-white shadow-sm outline-none">
                        <div className="space-y-2">
                            <Label>Product Selection Mode</Label>
                            <Select
                                value={selectionMode}
                                onValueChange={(val: any) => setSelectionMode(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="manual">Manual Selection</SelectItem>
                                    <SelectItem value="automatic">Automatic Filter-based</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectionMode === "manual" ? (
                            <div className="space-y-6 pt-2">
                                <div>
                                    <Label className="text-base font-semibold">Selected Products ({selectedProducts.length})</Label>
                                    <div className="mt-3 flex flex-wrap gap-2 max-h-[200px] overflow-y-auto border p-3 rounded-lg bg-slate-50">
                                        {selectedProducts.length > 0 ? (
                                            selectedProducts.map((prod) => (
                                                <div key={prod._id} className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded-md text-xs shadow-sm">
                                                    <span className="truncate max-w-[200px] font-medium">{prod.product_title}</span>
                                                    <button type="button" onClick={() => handleRemoveProduct(prod._id)} className="text-red-500 hover:text-red-700 transition ml-1">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 p-1">No products selected. Search below to add.</span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <Label className="flex items-center gap-2 text-base font-semibold">
                                        <Search className="h-5 w-5 text-gray-450" />
                                        Search Products to Add
                                    </Label>
                                    <Input
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder="Type to search products..."
                                        className="mt-3"
                                    />

                                    <div className="mt-3 border rounded-lg max-h-[250px] overflow-y-auto divide-y bg-white">
                                        {searchedProducts.length > 0 ? (
                                            searchedProducts.map((prod: any) => {
                                                const isSelected = !!selectedProducts.find((p) => p._id === prod._id);
                                                return (
                                                    <div key={prod._id} className="flex items-center justify-between p-3 hover:bg-slate-50 text-sm">
                                                        <div className="flex items-center gap-3 truncate">
                                                            {prod.thumbnail && <img src={prod.thumbnail} className="w-10 h-10 object-contain border rounded bg-white" />}
                                                            <span className="truncate font-medium">{prod.product_title}</span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={isSelected ? "outline" : "default"}
                                                            onClick={() => isSelected ? handleRemoveProduct(prod._id) : handleAddProduct(prod)}
                                                        >
                                                            {isSelected ? "Selected" : "Add"}
                                                        </Button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 text-center text-sm text-gray-400">No matching products found.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pt-2">
                                {/* Brand Filters */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Filter by Brands</Label>
                                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto border p-3 rounded-lg bg-slate-50">
                                        {allBrands.map((brand: any) => {
                                            const isChecked = filterBrands.includes(brand.name);
                                            return (
                                                <button
                                                    type="button"
                                                    key={brand._id}
                                                    onClick={() => toggleBrandFilter(brand.name)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border font-medium transition ${isChecked
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-gray-600 border-slate-200 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {isChecked && <Check className="h-3.5 w-3.5" />}
                                                    {brand.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Category Filters */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Filter by Categories</Label>
                                    <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto border p-3 rounded-lg bg-slate-50">
                                        {allCategories.map((cat: any) => {
                                            const isChecked = filterCategories.includes(cat._id);
                                            return (
                                                <button
                                                    type="button"
                                                    key={cat._id}
                                                    onClick={() => toggleCategoryFilter(cat._id)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border font-medium transition ${isChecked
                                                        ? "bg-primary text-white border-primary"
                                                        : "bg-white text-gray-600 border-slate-200 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {isChecked && <Check className="h-3.5 w-3.5" />}
                                                    {cat.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Tag Filters */}
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Filter by Tags</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newTagInput}
                                            onChange={(e) => setNewTagInput(e.target.value)}
                                            placeholder="e.g. Glass Skin"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTagFilter();
                                                }
                                            }}
                                        />
                                        <Button type="button" onClick={addTagFilter}>Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {filterTags.map((tag) => (
                                            <div key={tag} className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                                                <span>{tag}</span>
                                                <button type="button" onClick={() => removeTagFilter(tag)} className="text-gray-400 hover:text-red-500 transition">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* FAQ Tab */}
                    <TabsContent value="faq" className="space-y-6 rounded-xl border p-6 bg-white shadow-sm outline-none">
                        <div className="flex items-center justify-between border-b pb-4">
                            <Label className="text-base font-semibold">Frequently Asked Questions ({faqs.length})</Label>
                            <Button type="button" size="sm" onClick={addFaq} className="gap-1.5">
                                <Plus className="h-4 w-4" /> Add FAQ
                            </Button>
                        </div>

                        <div className="space-y-4 mt-4 max-h-[450px] overflow-y-auto border p-3 rounded-lg bg-slate-50">
                            {faqs.length > 0 ? (
                                faqs.map((faq, index) => (
                                    <div key={index} className="bg-white border border-slate-100 rounded-xl p-4 space-y-3 relative shadow-sm">
                                        <div className="absolute top-3 right-3">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 rounded-full"
                                                onClick={() => removeFaq(index)}
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </Button>
                                        </div>
                                        <div className="space-y-1.5 pr-10">
                                            <Label className="text-xs font-semibold text-slate-500">Question {index + 1}</Label>
                                            <Input
                                                value={faq.question}
                                                onChange={(e) => updateFaq(index, "question", e.target.value)}
                                                placeholder="Enter question..."
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-500">Answer</Label>
                                            <Textarea
                                                value={faq.answer}
                                                onChange={(e) => updateFaq(index, "answer", e.target.value)}
                                                placeholder="Enter answer..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400 text-sm">No FAQs defined yet. Click "Add FAQ" to start.</div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6 rounded-xl border p-6 bg-white shadow-sm outline-none">
                        <div className="space-y-2">
                            <Label htmlFor="col-display-order">Display Order</Label>
                            <Input
                                id="col-display-order"
                                type="number"
                                value={displayOrder}
                                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
