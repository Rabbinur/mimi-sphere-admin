"use client"

import CreateEditBrandDialog from "@/app/dashboard/brands/_components/CreateEditBrandDialog"
import { useAllBrandsQuery } from "@/components/Redux/RTK/brandApi"
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { type MediaFile, MediaLibrary } from "@/components/ui/media-manager"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { askAI } from "@/lib/gemini"
import { cn } from "@/lib/utils"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import { Editor } from "@tinymce/tinymce-react"
import { Check, ChevronsUpDown, Loader2, Plus, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"
import { toast } from "sonner"

export default function BasicInfoCard({ form }: { form: UseFormReturn<ProductFormValues> }) {
    const [productImages, setProductImages] = useState<MediaFile[]>([])
    const [selectedImage, setSelectedImage] = useState<MediaFile[]>([])
    const [isOptimizingTitle, setIsOptimizingTitle] = useState(false)
    const [isOptimizingDesc, setIsOptimizingDesc] = useState(false)
    const { data: categories } = useAllCategoryQuery(false)
    const title = form.watch("product_title")
    const description = form.watch("product_description")
    const attributes = form.watch("product_attributes")
    const thumbnail = form.watch("thumbnail")
    const images = form.watch("product_images")

    const [brandOpen, setBrandOpen] = useState(false)
    const [brandSearch, setBrandSearch] = useState("")
    const { data: brandsResponse, refetch: refetchBrands } = useAllBrandsQuery(undefined)
    const brands = (brandsResponse as any)?.data?.brands || []
    const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false)

    // 🔄 Sync local state with form values (Crucial for Edit mode)
    useEffect(() => {
        if (thumbnail && selectedImage.length === 0) {
            setSelectedImage([{ _id: "initial-thumb", url: thumbnail, title: "Current Thumbnail", size: 0 } as any])
        }
    }, [thumbnail])

    useEffect(() => {
        if (images && images.length > 0 && productImages.length === 0) {
            setProductImages(images.map((url, i) => ({
                _id: `initial-img-${i}`,
                url,
                title: `Image ${i + 1}`,
                size: 0
            } as any)))
        }
    }, [images])

    const handleImageSelect = (files: MediaFile[]) => {
        setSelectedImage(files)
        if (files.length > 0) {
            form.setValue("thumbnail", files[0].url, { shouldValidate: true })
        }
    }

    const handleProductImagesSelect = (files: MediaFile[]) => {
        setProductImages(files)
        const urls = files.map((file) => file.url).filter(Boolean) as string[]
        form.setValue("product_images", urls, { shouldValidate: true })
    }

    const handleOptimizeTitle = async () => {
        if (!title) return toast.error("Please enter a title first")
        try {
            setIsOptimizingTitle(true)
            const attrText = attributes?.map(a => `${a.label}: ${a.value}`).join(", ") || ""
            const prompt = `Act as an e-commerce SEO expert.
Optimize this product title for SEO.

Rules:
- Length must be between 50 - 70 characters
- Include main keyword + 1 - 2 important attributes
- Keep it clear, natural, and clickable
- No extra explanation
- No symbols like * or quotes

Original Title: ${title}
Attributes: ${attrText}

Return ONLY the optimized title.`;

            const result = await askAI(prompt)
            if (result) {
                form.setValue("product_title", result.trim())
                toast.success("Title optimized by AI")
            } else {
                toast.error("AI could not generate a title")
            }
        } catch (err) {
            toast.error("AI enhancement failed")
        } finally {
            setIsOptimizingTitle(false)
        }
    }

    const handleOptimizeDescription = async () => {
        if (!title) return toast.error("Please enter a title first")
        try {
            setIsOptimizingDesc(true)
            const attrText = attributes?.map(a => `${a.label}: ${a.value}`).join(", ") || ""
            const prompt = `Act as a professional e-commerce copywriter and SEO expert. 
Write a high-converting, SEO-friendly product description in English 

Structure:
1. Start with a catchy intro paragraph (max 160 characters) - this is crucial for SEO and meta description.
2. A section for key features and benefits.
3. A neatly organized list of specifications based on the attributes provided below.

Product Context:
- Title: ${title}
- Attributes: ${attrText}
- Base Details: ${description}

Rules:
- Use standard HTML tags (p, h3, ul, li, strong).
- Ensure the language is natural, persuasive, and organized.
- No markdown code blocks (no \`\`\`html).
- Return ONLY the HTML content.`

            const result = await askAI(prompt)
            if (result) {
                // Clean markdown artifacts if any
                const cleaned = result.replace(/```html|```/g, "").trim()
                form.setValue("product_description", cleaned)
                toast.success("Description enhanced by AI")
            } else {
                toast.error("AI could not generate a description")
            }
        } catch (err) {
            toast.error("AI enhancement failed")
        } finally {
            setIsOptimizingDesc(false)
        }
    }

    return (
        <Card className=" p-2 md:p-4 shadow-sm rounded-md">
            <CardHeader className="p-2 md:p-4">
                <CardTitle>Product Information</CardTitle>
                <CardDescription>Enter the basic details about your product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-2 md:p-4">
                <FormField
                    control={form.control}
                    name="product_title"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Product Title*</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-primary gap-1 hover:bg-primary/5 px-2"
                                    onClick={handleOptimizeTitle}
                                    disabled={isOptimizingTitle}
                                >
                                    {isOptimizingTitle ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Optimize
                                </Button>
                            </div>
                            <FormControl>
                                <Input placeholder="Enter product title" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="product_description"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Product Description*</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-[10px] text-primary gap-1 hover:bg-primary/5 px-2"
                                    onClick={handleOptimizeDescription}
                                    disabled={isOptimizingDesc}
                                >
                                    {isOptimizingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                    AI Enhance
                                </Button>
                            </div>
                            <FormControl>
                                <Editor
                                    apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                                    value={field.value ?? ""}
                                    onEditorChange={(content: string) => field.onChange(content)}
                                    init={{
                                        height: 300,
                                        menubar: false,
                                        plugins: [
                                            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
                                            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
                                            "insertdatetime", "media", "table", "help", "wordcount"
                                        ],
                                        toolbar:
                                            "undo redo | blocks | " +
                                            "bold italic forecolor | alignleft aligncenter " +
                                            "alignright alignjustify | bullist numlist outdent indent | " +
                                            "removeformat | help",
                                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="space-y-2 flex flex-col">
                    <FormLabel className="text-sm font-medium">Product Thumbnail*</FormLabel>

                    <div className="flex items-center gap-2">
                        <MediaLibrary onSelect={handleImageSelect} multiple={false} maxFiles={1} title="Upload Thumbnail" />
                    </div>
                </div>

                <div>
                    {selectedImage.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Selected Thumbnail</h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedImage.map((image) => (
                                    <div
                                        key={image._id}
                                        className="group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="relative">
                                            <img
                                                src={image.url || "/placeholder.svg"}
                                                alt={image.title}
                                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        <div className="p-3">
                                            <p className="text-sm font-medium truncate text-gray-800">{image.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{(image.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 flex flex-col">
                    <FormLabel className="text-sm font-medium">Product Images</FormLabel>

                    <div className="flex items-center gap-2">
                        <MediaLibrary onSelect={handleProductImagesSelect} multiple maxFiles={10} title="Upload Product Images" />
                    </div>
                </div>

                {productImages.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Product Images ({productImages.length})</h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {productImages.map((image, index) => (
                                <div key={image._id} className="group relative border rounded-xl overflow-hidden bg-white shadow-sm">
                                    <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-36 object-cover" />

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                        onClick={() => {
                                            const updated = productImages.filter((_, i) => i !== index)
                                            setProductImages(updated)
                                            form.setValue(
                                                "product_images",
                                                updated.map((f) => f.url),
                                                { shouldValidate: true },
                                            )
                                        }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="product_status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className=" bg-white">
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="product_vendor"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Brand</FormLabel>
                                <Popover open={brandOpen} onOpenChange={setBrandOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between h-10 font-normal border-slate-200",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? brands?.find((brand: any) => brand.name === field.value)?.name || field.value
                                                    : "Select Brand"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white" align="start">
                                        <div className="flex flex-col">
                                            <div className="p-2 border-b flex items-center gap-2">
                                                <Input
                                                    placeholder="Search brand..."
                                                    value={brandSearch}
                                                    onChange={(e) => setBrandSearch(e.target.value)}
                                                    className="h-8 text-xs flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[10px] px-2 gap-1 border-primary/20 text-primary hover:bg-primary/5"
                                                    onClick={() => {
                                                        setIsBrandDialogOpen(true)
                                                        setBrandOpen(false)
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    New
                                                </Button>
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto p-1">
                                                {brands && brands.filter((b: any) => b.name.toLowerCase().includes(brandSearch.toLowerCase())).length > 0 ? (
                                                    brands.filter((b: any) => b.name.toLowerCase().includes(brandSearch.toLowerCase())).map((brand: any) => (
                                                        <div
                                                            key={brand._id}
                                                            className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-slate-100 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                form.setValue("product_vendor", brand.name)
                                                                setBrandOpen(false)
                                                                setBrandSearch("")
                                                            }}
                                                        >
                                                            <Check className={cn("h-4 w-4 text-primary", field.value === brand.name ? "opacity-100" : "opacity-0")} />
                                                            <span className="truncate">{brand.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                        No brands found.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <CreateEditBrandDialog
                    mode="create"
                    open={isBrandDialogOpen}
                    onOpenChange={setIsBrandDialogOpen}
                    onSuccess={() => {
                        refetchBrands()
                        setIsBrandDialogOpen(false)
                    }}
                />



            </CardContent>
        </Card>
    )
}
