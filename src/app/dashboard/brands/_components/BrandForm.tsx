"use client";

import { useAllBlogsQuery } from "@/components/Redux/RTK/blogApi";
import { useCreateBrandMutation, useSingleBrandQuery, useUpdateBrandMutation } from "@/components/Redux/RTK/brandApi";
import { useAllProductsQuery } from "@/components/Redux/RTK/productApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaFile, MediaLibrary } from "@/components/ui/media-manager";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Plus, Save, Search, Trash2, X } from "lucide-react";
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

interface BrandFormProps {
    mode: "create" | "edit";
    brandId?: string;
}

export default function BrandForm({ mode, brandId }: BrandFormProps) {
    const router = useRouter();
    const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
    const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();

    // Fetch full brand details including CMS fields if editing
    const { data: loadedBrand, isLoading: loadingBrand } = useSingleBrandQuery(brandId!, {
        skip: mode !== "edit" || !brandId,
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Form States
    const [name, setName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [displayOrder, setDisplayOrder] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);

    // Content CMS States
    const [heroTitle, setHeroTitle] = useState("");
    const [heroDescription, setHeroDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [content, setContent] = useState("");

    // SEO States
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [ogImage, setOgImage] = useState("");

    // FAQs States
    const [faqs, setFaqs] = useState<TFaq[]>([]);

    // Merchandising States
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [selectedBlogs, setSelectedBlogs] = useState<any[]>([]);
    const [blogSearch, setBlogSearch] = useState("");

    // JSON Import States
    const [importOpen, setImportOpen] = useState(false);
    const [importJsonText, setImportJsonText] = useState("");

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
            if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
            if (typeof parsed.isActive === "boolean") setIsActive(parsed.isActive);
            if (typeof parsed.displayOrder === "number") setDisplayOrder(parsed.displayOrder);
            else if (typeof parsed.order === "number") setDisplayOrder(parsed.order);
            if (typeof parsed.isFeatured === "boolean") setIsFeatured(parsed.isFeatured);

            if (parsed.heroTitle) setHeroTitle(parsed.heroTitle);
            if (parsed.heroDescription) setHeroDescription(parsed.heroDescription);
            if (parsed.coverImage) setCoverImage(parsed.coverImage);
            if (parsed.content) setContent(parsed.content);

            if (parsed.metaTitle) setMetaTitle(parsed.metaTitle);
            if (parsed.metaDescription) setMetaDescription(parsed.metaDescription);
            if (parsed.metaKeywords) setMetaKeywords(parsed.metaKeywords);
            if (parsed.ogImage) setOgImage(parsed.ogImage);

            if (Array.isArray(parsed.FAQs)) {
                const formattedFaqs = parsed.FAQs.map((faq: any) => ({
                    question: faq.question || "",
                    answer: faq.answer || "",
                }));
                setFaqs(formattedFaqs);
            }

            if (Array.isArray(parsed.featuredProducts)) {
                const formattedProds = parsed.featuredProducts.map((p: any) => {
                    if (typeof p === "string") return { _id: p, product_title: `Product ID: ${p}` };
                    return { _id: p._id || p.id, product_title: p.product_title || p.name || `Product ID: ${p._id || p.id}` };
                }).filter((p: any) => p._id);
                setSelectedProducts(formattedProds);
            }

            if (Array.isArray(parsed.featuredBlogs)) {
                const formattedBlogs = parsed.featuredBlogs.map((b: any) => {
                    if (typeof b === "string") return { _id: b, title: `Blog ID: ${b}` };
                    return { _id: b._id || b.id, title: b.title || b.name || `Blog ID: ${b._id || b.id}` };
                }).filter((b: any) => b._id);
                setSelectedBlogs(formattedBlogs);
            }

            toast.success("JSON imported and applied successfully!");
            setImportOpen(false);
            setImportJsonText("");
        } catch (err: any) {
            toast.error("Failed to parse JSON: " + err.message);
        }
    };

    // Search Queries
    const { data: productsData } = useAllProductsQuery(
        { searchTerm: productSearch, limit: 8 }
    );
    const { data: blogsData } = useAllBlogsQuery(
        { page: 1, limit: 10 }
    );

    const searchedProducts = productsData?.data?.products || [];
    const allBlogsList = blogsData?.data || [];

    // Filter blogs locally based on search
    const filteredBlogs = allBlogsList.filter((blog: any) =>
        blog.title?.toLowerCase().includes(blogSearch.toLowerCase())
    );

    // Load initial values
    useEffect(() => {
        if (mode === "edit" && loadedBrand) {
            setName(loadedBrand.name || "");
            setLogoUrl(loadedBrand.logoUrl || "");
            setIsActive(loadedBrand.isActive ?? true);
            setDisplayOrder(loadedBrand.displayOrder || loadedBrand.order || 0);
            setIsFeatured(loadedBrand.isFeatured || false);

            setHeroTitle(loadedBrand.heroTitle || "");
            setHeroDescription(loadedBrand.heroDescription || "");
            setCoverImage(loadedBrand.coverImage || "");
            setContent(loadedBrand.content || "");

            setMetaTitle(loadedBrand.metaTitle || "");
            setMetaDescription(loadedBrand.metaDescription || "");
            setMetaKeywords(loadedBrand.metaKeywords || "");
            setOgImage(loadedBrand.ogImage || "");

            setFaqs(loadedBrand.FAQs || []);
            setSelectedProducts(loadedBrand.featuredProducts || []);
            setSelectedBlogs(loadedBrand.featuredBlogs || []);
        } else if (mode === "create") {
            setName("");
            setLogoUrl("");
            setIsActive(true);
            setDisplayOrder(0);
            setIsFeatured(false);

            setHeroTitle("");
            setHeroDescription("");
            setCoverImage("");
            setContent("");

            setMetaTitle("");
            setMetaDescription("");
            setMetaKeywords("");
            setOgImage("");

            setFaqs([]);
            setSelectedProducts([]);
            setSelectedBlogs([]);
        }
    }, [mode, loadedBrand]);

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

    // Blog Selection Handlers
    const handleAddBlog = (blog: any) => {
        if (!selectedBlogs.find((b) => b._id === blog._id)) {
            setSelectedBlogs([...selectedBlogs, blog]);
        }
    };

    const handleRemoveBlog = (blogId: string) => {
        setSelectedBlogs(selectedBlogs.filter((b) => b._id !== blogId));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const payload = {
            name: name.trim(),
            logoUrl: logoUrl || undefined,
            isActive,
            order: Number(displayOrder),
            displayOrder: Number(displayOrder),
            isFeatured,
            heroTitle: heroTitle.trim() || undefined,
            heroDescription: heroDescription.trim() || undefined,
            coverImage: coverImage || undefined,
            content: content || undefined,
            metaTitle: metaTitle.trim() || undefined,
            metaDescription: metaDescription.trim() || undefined,
            metaKeywords: metaKeywords.trim() || undefined,
            ogImage: ogImage || undefined,
            FAQs: faqs,
            featuredProducts: selectedProducts.map((p) => p._id),
            featuredBlogs: selectedBlogs.map((b) => b._id),
        };

        try {
            let res;
            if (mode === "create") {
                res = await createBrand(payload).unwrap();
                if (res.success || res.statusCode === 201) {
                    toast.success(res.message || "Brand created successfully");
                } else {
                    toast.error(res.message || "Failed to create brand");
                    return;
                }
            } else if (mode === "edit" && brandId) {
                res = await updateBrand({
                    id: brandId,
                    data: payload,
                }).unwrap();
                if (res.success || res.statusCode === 200) {
                    toast.success(res.message || "Brand updated successfully");
                } else {
                    toast.error(res.message || "Failed to update brand");
                    return;
                }
            }

            router.push("/dashboard/brands");
        } catch (err: any) {
            toast.error(err?.data?.message || "Operation failed");
        }
    };

    if (!mounted || loadingBrand) {
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
                        <Link href="/dashboard/brands" className="rounded-md p-1 hover:bg-muted transition">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-slate-900">
                                {mode === "create" ? "Create Brand Page" : `Edit Brand Page: ${name}`}
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
                                    <DialogTitle>Import Brand JSON Data</DialogTitle>
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
                                                    const promptText = `Generate a valid JSON object for the brand "${name || "[Brand Name]"}" with full CMS content. The output MUST be strictly valid JSON without any markdown code blocks, backticks, or extra explanation. Use this exact schema structure:
{
  "name": "${name || "[Brand Name]"}",
  "isActive": true,
  "displayOrder": 1,
  "isFeatured": false,
  "heroTitle": "Engaging hero banner title about the brand",
  "heroDescription": "Compelling short description for the brand hero section",
  "content": "Detailed HTML/Rich Text content about the brand history, values, and product lines using p, strong, and list tags",
  "metaTitle": "SEO optimized meta title for search engines",
  "metaDescription": "SEO meta description under 160 characters",
  "metaKeywords": "comma, separated, seo, keywords",
  "FAQs": [
    {
      "question": "An important customer question about the brand?",
      "answer": "Clear and detailed answer to the question."
    },
    {
      "question": "Another frequently asked question?",
      "answer": "Detailed answer."
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
                                            Copy this prompt and paste it into ChatGPT/Gemini to write the brand CMS JSON for you!
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
                                            placeholder='{ "name": "CosRx", "heroTitle": "Premium Skincare", ... }'
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

                        <Button variant="outline" asChild>
                            <Link href="/dashboard/brands">Discard</Link>
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={creating || updating}>
                            {creating || updating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {mode === "create" ? "Create Brand" : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="container mx-auto mt-8 px-4 lg:px-8 pb-20">
                <div className=" mx-auto">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid grid-cols-7 mb-6 bg-gray-50 p-1 rounded-lg">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="seo">SEO</TabsTrigger>
                            <TabsTrigger value="products">Products</TabsTrigger>
                            <TabsTrigger value="blogs">Blogs</TabsTrigger>
                            <TabsTrigger value="faq">FAQ</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        {/* Basic Tab */}
                        <TabsContent value="basic" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <h3 className="text-lg font-medium border-b pb-2">Basic Details</h3>
                            <div className="space-y-2">
                                <Label htmlFor="brand-name">Brand Name <span className="text-red-500">*</span></Label>
                                <Input id="brand-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CosRx" />
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="mb-1">Brand Logo</Label>
                                <MediaLibrary
                                    onSelect={(files: MediaFile[]) => {
                                        if (files.length > 0) setLogoUrl(files[0].url);
                                    }}
                                    multiple={false}
                                    title="Select Brand Logo"
                                />
                                {logoUrl && (
                                    <div className="mt-2 relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-2">
                                        <img src={logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                            onClick={() => setLogoUrl("")}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>Active Status</Label>
                                    <div className="text-xs text-gray-500">Show or hide this brand page across the site</div>
                                </div>
                                <Switch checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        </TabsContent>

                        {/* Content Tab */}
                        <TabsContent value="content" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <h3 className="text-lg font-medium border-b pb-2">Header & Main Content</h3>
                            <div className="space-y-2">
                                <Label htmlFor="hero-title">Hero Title</Label>
                                <Input id="hero-title" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. Premium K-Beauty Skincare Solutions" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="hero-desc">Hero Description</Label>
                                <Textarea id="hero-desc" value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} placeholder="Short engaging description for the header section..." />
                            </div>

                            <div className="space-y-2 flex flex-col">
                                <Label className="mb-1">Cover Image</Label>
                                <MediaLibrary
                                    onSelect={(files: MediaFile[]) => {
                                        if (files.length > 0) setCoverImage(files[0].url);
                                    }}
                                    multiple={false}
                                    title="Select Cover Image"
                                />
                                {coverImage && (
                                    <div className="mt-2 relative w-full h-40 border rounded-lg overflow-hidden bg-gray-50">
                                        <img src={coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                            onClick={() => setCoverImage("")}
                                        >
                                            <X className="h-3 w-3" />
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
                                            height: 400,
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
                        <TabsContent value="seo" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <h3 className="text-lg font-medium border-b pb-2">Search Engine Optimization (SEO)</h3>
                            <div className="space-y-2">
                                <Label htmlFor="meta-title">Meta Title</Label>
                                <Input id="meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO Meta Title" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta-desc">Meta Description</Label>
                                <Textarea id="meta-desc" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="SEO Meta Description" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meta-keys">Meta Keywords</Label>
                                <Input id="meta-keys" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="keywords, separated, by, commas" />
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
                                    <div className="mt-2 relative w-48 h-28 border rounded-lg overflow-hidden bg-gray-50">
                                        <img src={ogImage} alt="OG preview" className="w-full h-full object-cover" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                            onClick={() => setOgImage("")}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Featured Products Tab */}
                        <TabsContent value="products" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <h3 className="text-lg font-medium border-b pb-2">Featured Products Merchandising</h3>
                            <div>
                                <Label>Selected Featured Products ({selectedProducts.length})</Label>
                                <div className="mt-2 flex flex-wrap gap-2 max-h-[180px] overflow-y-auto border p-2.5 rounded-lg bg-gray-50">
                                    {selectedProducts.length > 0 ? (
                                        selectedProducts.map((prod) => (
                                            <div key={prod._id} className="flex items-center gap-1.5 bg-white border px-2.5 py-1 rounded-md text-xs shadow-sm">
                                                <span className="truncate max-w-[200px]">{prod.product_title}</span>
                                                <button type="button" onClick={() => handleRemoveProduct(prod._id)} className="text-red-500 hover:text-red-700">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 p-1">No products selected yet. Search below to add.</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    Search Products to Add
                                </Label>
                                <Input
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Type to search products..."
                                    className="mt-2"
                                />

                                <div className="mt-2 border rounded-lg max-h-[250px] overflow-y-auto divide-y bg-white">
                                    {searchedProducts.length > 0 ? (
                                        searchedProducts.map((prod: any) => {
                                            const isSelected = !!selectedProducts.find((p) => p._id === prod._id);
                                            return (
                                                <div key={prod._id} className="flex items-center justify-between p-2 hover:bg-gray-50 text-sm">
                                                    <div className="flex items-center gap-2 truncate">
                                                        {prod.thumbnail && <img src={prod.thumbnail} className="w-8 h-8 object-contain border rounded" />}
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
                                        <div className="p-4 text-center text-xs text-gray-400">No matching products found.</div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Featured Blogs Tab */}
                        <TabsContent value="blogs" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <h3 className="text-lg font-medium border-b pb-2">Featured Articles & Buying Guides</h3>
                            <div>
                                <Label>Selected Featured Blogs ({selectedBlogs.length})</Label>
                                <div className="mt-2 flex flex-wrap gap-2 max-h-[180px] overflow-y-auto border p-2.5 rounded-lg bg-gray-50">
                                    {selectedBlogs.length > 0 ? (
                                        selectedBlogs.map((blog) => (
                                            <div key={blog._id} className="flex items-center gap-1.5 bg-white border px-2.5 py-1 rounded-md text-xs shadow-sm">
                                                <span className="truncate max-w-[220px]">{blog.title}</span>
                                                <button type="button" onClick={() => handleRemoveBlog(blog._id)} className="text-red-500 hover:text-red-700">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 p-1">No blogs selected yet. Search below to add.</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <Label className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-gray-400" />
                                    Search Blogs to Add
                                </Label>
                                <Input
                                    value={blogSearch}
                                    onChange={(e) => setBlogSearch(e.target.value)}
                                    placeholder="Type to search blogs..."
                                    className="mt-2"
                                />

                                <div className="mt-2 border rounded-lg max-h-[250px] overflow-y-auto divide-y bg-white">
                                    {filteredBlogs.length > 0 ? (
                                        filteredBlogs.map((blog: any) => {
                                            const isSelected = !!selectedBlogs.find((b) => b._id === blog._id);
                                            return (
                                                <div key={blog._id} className="flex items-center justify-between p-2 hover:bg-gray-50 text-sm">
                                                    <span className="truncate font-medium">{blog.title}</span>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={isSelected ? "outline" : "default"}
                                                        onClick={() => isSelected ? handleRemoveBlog(blog._id) : handleAddBlog(blog)}
                                                    >
                                                        {isSelected ? "Selected" : "Add"}
                                                    </Button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-xs text-gray-400">No matching blogs found.</div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* FAQ Tab */}
                        <TabsContent value="faq" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
                                <Button type="button" size="sm" onClick={addFaq} className="gap-1">
                                    <Plus className="h-4 w-4" /> Add FAQ
                                </Button>
                            </div>

                            <div className="space-y-4 max-h-[420px] overflow-y-auto border p-4 rounded-lg bg-gray-50">
                                {faqs.length > 0 ? (
                                    faqs.map((faq, index) => (
                                        <div key={index} className="bg-white border rounded-lg p-4 space-y-3 relative shadow-sm">
                                            <div className="absolute top-2 right-2">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => removeFaq(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-1 pr-8">
                                                <Label className="text-xs">Question {index + 1}</Label>
                                                <Input
                                                    value={faq.question}
                                                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                                                    placeholder="Enter question..."
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Answer</Label>
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
                                    <div className="text-center py-8 text-gray-400 text-sm">No FAQs defined yet. Click "Add FAQ" to start.</div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-6 border rounded-xl p-6 bg-white outline-none">
                            <h3 className="text-lg font-medium border-b pb-2">Page & Merchandising Settings</h3>
                            <div className="space-y-2">
                                <Label htmlFor="display-order">Display Order</Label>
                                <Input
                                    id="display-order"
                                    type="number"
                                    value={displayOrder}
                                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                                    placeholder="0"
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>Featured Brand</Label>
                                    <div className="text-xs text-gray-500">Showcase this brand in featured homepage carousels or sections</div>
                                </div>
                                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
