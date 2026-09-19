"use client";

import { useGetCmsQuery, useUpdateCmsMutation } from "@/components/Redux/RTK/cmsApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaLibrary } from "@/components/ui/media-manager";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TCMS, THeroFeature, THeroSlide, TBentoGrid, TBentoItem } from "@/types";
import { MoveDown, MoveUp, Plus, Trash2, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const { data: cmsResponse, isLoading, isError } = useGetCmsQuery();
    const { data: categories = [] } = useAllCategoryQuery(false);
    const [updateCms, { isLoading: isUpdating }] = useUpdateCmsMutation();
    const [formData, setFormData] = useState<TCMS | null>(null);

    useEffect(() => {
        if (cmsResponse?.data) {
            setFormData(cmsResponse.data);
        }
    }, [cmsResponse]);

    const handleSave = async () => {
        if (!formData) return;
        try {
            await updateCms(formData).unwrap();
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        }
    };

    if (isError) return <div className="p-6 text-red-500">Error loading settings. Please check if the server is running.</div>;
    if (isLoading) return <div className="p-6">Loading site settings...</div>;
    if (!formData) return <div className="p-6">No settings data available.</div>;

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen space-y-6">

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Site Settings</h1>
                <Button onClick={handleSave} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="company">Company & Social</TabsTrigger>
                    <TabsTrigger value="slider">Hero Slider</TabsTrigger>
                    <TabsTrigger value="features">Hero Features</TabsTrigger>
                </TabsList>


                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <Input
                                        value={formData.company.name}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, name: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={formData.company.email}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, email: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.company.phone}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, phone: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={formData.company.address}
                                        onChange={(e) => setFormData({ ...formData, company: { ...formData.company, address: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Social Links</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.social.links.map((link, idx) => (
                                <div key={idx} className="flex gap-4 items-end border-b pb-4 last:border-0">
                                    <div className="flex-1 space-y-2">
                                        <Label>Platform</Label>
                                        <Input
                                            value={link.platform}
                                            onChange={(e) => {
                                                const newLinks = [...formData.social.links];
                                                newLinks[idx].platform = e.target.value;
                                                setFormData({ ...formData, social: { links: newLinks } });
                                            }}
                                        />
                                    </div>
                                    <div className="flex-[2] space-y-2">
                                        <Label>URL</Label>
                                        <Input
                                            value={link.url}
                                            onChange={(e) => {
                                                const newLinks = [...formData.social.links];
                                                newLinks[idx].url = e.target.value;
                                                setFormData({ ...formData, social: { links: newLinks } });
                                            }}
                                        />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            const newLinks = formData.social.links.filter((_, i) => i !== idx);
                                            setFormData({ ...formData, social: { links: newLinks } });
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFormData({ ...formData, social: { links: [...formData.social.links, { platform: "", url: "" }] } });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Social Link
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="slider">
                    <Tabs defaultValue="desktop" className="w-full">
                        <div className="flex justify-between items-center mb-4">
                            <TabsList>
                                <TabsTrigger value="desktop">Desktop Slider</TabsTrigger>
                                <TabsTrigger value="mobile">Mobile Slider</TabsTrigger>
                            </TabsList>
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded border">
                                <strong>Ratios:</strong> Desktop: 850x450px (17:9) | Mobile: 450x200px (9:4)
                            </div>
                        </div>

                        <TabsContent value="desktop">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Desktop Hero Slider</CardTitle>
                                        <CardDescription>Manage images for large screens. Recommended: 850x450px.</CardDescription>
                                    </div>
                                    <Button onClick={() => {
                                        const newSlides = [...(formData.heroSliderDesktop || [])];
                                        newSlides.push({ image: "", link: "", alt: "" });
                                        setFormData({ ...formData, heroSliderDesktop: newSlides });
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Desktop Slide
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(formData.heroSliderDesktop || []).map((slide, idx) => (
                                        <div key={idx} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSlide("desktop", idx, -1)}>
                                                    <MoveUp className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" disabled={idx === (formData.heroSliderDesktop?.length || 0) - 1} onClick={() => moveSlide("desktop", idx, 1)}>
                                                    <MoveDown className="w-4 h-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => removeSlide("desktop", idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pt-6">
                                                <div className="space-y-2">
                                                    <Label>Slide Image</Label>
                                                    <ImageSelector
                                                        value={slide.image}
                                                        onSelect={(val) => updateSlide("desktop", idx, { image: val })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Link URL</Label>
                                                    <Input
                                                        value={slide.link}
                                                        placeholder="/shop"
                                                        onChange={(e) => updateSlide("desktop", idx, { link: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Alt Text</Label>
                                                    <Input
                                                        value={slide.alt}
                                                        placeholder="Summer Collection"
                                                        onChange={(e) => updateSlide("desktop", idx, { alt: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="mobile">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Mobile Hero Slider</CardTitle>
                                        <CardDescription>Manage images for mobile devices. Recommended: 450x200px.</CardDescription>
                                    </div>
                                    <Button onClick={() => {
                                        const newSlides = [...(formData.heroSliderMobile || [])];
                                        newSlides.push({ image: "", link: "", alt: "" });
                                        setFormData({ ...formData, heroSliderMobile: newSlides });
                                    }}>
                                        <Plus className="w-4 h-4 mr-2" /> Add Mobile Slide
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(formData.heroSliderMobile || []).map((slide, idx) => (
                                        <div key={idx} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <Button variant="ghost" size="icon" disabled={idx === 0} onClick={() => moveSlide("mobile", idx, -1)}>
                                                    <MoveUp className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" disabled={idx === (formData.heroSliderMobile?.length || 0) - 1} onClick={() => moveSlide("mobile", idx, 1)}>
                                                    <MoveDown className="w-4 h-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => removeSlide("mobile", idx)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 pt-6">
                                                <div className="space-y-2">
                                                    <Label>Slide Image</Label>
                                                    <ImageSelector
                                                        value={slide.image}
                                                        onSelect={(val) => updateSlide("mobile", idx, { image: val })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Link URL</Label>
                                                    <Input
                                                        value={slide.link}
                                                        placeholder="/shop"
                                                        onChange={(e) => updateSlide("mobile", idx, { link: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Alt Text</Label>
                                                    <Input
                                                        value={slide.alt}
                                                        placeholder="Summer Collection"
                                                        onChange={(e) => updateSlide("mobile", idx, { alt: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>

                <TabsContent value="features">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Hero Features</CardTitle>
                                <CardDescription>Manage the side cards next to the slider. Recommended: 410x215px.</CardDescription>
                            </div>
                            <Button
                                disabled={(formData.heroFeatures?.length || 0) >= 2}
                                onClick={() => {
                                    const newFeatures = [...(formData.heroFeatures || [])];
                                    newFeatures.push({ title: "", subtitle: "", image: "", link: "" });
                                    setFormData({ ...formData, heroFeatures: newFeatures });
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Feature (Max 2)
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(formData.heroFeatures || []).map((feature, idx) => (
                                <div key={idx} className="p-4 border rounded-lg space-y-4 bg-muted/30 relative">
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => {
                                                const newFeatures = formData.heroFeatures.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, heroFeatures: newFeatures });
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={feature.title}
                                                    onChange={(e) => updateFeature(idx, { title: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Subtitle</Label>
                                                <Input
                                                    value={feature.subtitle}
                                                    onChange={(e) => updateFeature(idx, { subtitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Link</Label>
                                                <Input
                                                    value={feature.link}
                                                    onChange={(e) => updateFeature(idx, { link: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image (410x215px)</Label>
                                            <ImageSelector
                                                value={feature.image}
                                                onSelect={(val) => updateFeature(idx, { image: val })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bento">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">Best Collections (Bento Grid)</CardTitle>
                                <CardDescription>
                                    Manage the dynamic Bento Grid section on the storefront home page.
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="bento-toggle"
                                        checked={formData.bentoGrid?.isEnabled ?? true}
                                        onCheckedChange={(checked) =>
                                            updateBentoGrid({ isEnabled: checked })
                                        }
                                    />
                                    <Label htmlFor="bento-toggle" className="font-semibold cursor-pointer">
                                        {(formData.bentoGrid?.isEnabled ?? true)
                                            ? "Section Visible"
                                            : "Section Hidden"}
                                    </Label>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={addBentoItem}
                                >
                                    <Plus className="w-4 h-4 mr-1.5" /> Add Collection Card
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Section Header Configuration */}
                            <div className="p-4 bg-muted/20 border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Section Tag / Subtitle</Label>
                                    <Input
                                        value={formData.bentoGrid?.tag ?? ""}
                                        placeholder="e.g. Handpicked For You"
                                        onChange={(e) => updateBentoGrid({ tag: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Small uppercase tag shown above the title (e.g. Handpicked For You)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Section Title / Headline</Label>
                                    <Input
                                        value={formData.bentoGrid?.title ?? ""}
                                        placeholder="e.g. Signature Collections"
                                        onChange={(e) => updateBentoGrid({ title: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Main section title (e.g. Signature Collections)
                                    </p>
                                </div>
                            </div>

                            {/* Cards List */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-bold text-slate-800">
                                        Collection Cards ({(formData.bentoGrid?.items || []).length})
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Card #1 is featured as the large hero card. Select a category to auto-fill route.
                                    </p>
                                </div>

                                {(formData.bentoGrid?.items || []).length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/10">
                                        <p className="text-sm text-muted-foreground mb-3">No cards added yet.</p>
                                        <Button type="button" variant="outline" size="sm" onClick={addBentoItem}>
                                            <Plus className="w-4 h-4 mr-1.5" /> Add First Card
                                        </Button>
                                    </div>
                                ) : (
                                    (formData.bentoGrid?.items || []).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-5 border rounded-xl space-y-4 bg-muted/20 relative shadow-sm hover:border-primary/40 transition-colors"
                                        >
                                            <div className="flex items-center justify-between border-b pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                                                        Card #{idx + 1}
                                                    </span>
                                                    {idx === 0 && (
                                                        <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded border border-rose-200">
                                                            Featured Hero Card
                                                        </span>
                                                    )}
                                                    {idx === 3 && (
                                                        <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                                                            Wide Bottom Banner
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={idx === 0}
                                                        onClick={() => moveBentoItem(idx, -1)}
                                                        title="Move Up"
                                                    >
                                                        <MoveUp className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        disabled={idx === (formData.bentoGrid?.items || []).length - 1}
                                                        onClick={() => moveBentoItem(idx, 1)}
                                                        title="Move Down"
                                                    >
                                                        <MoveDown className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="h-8 w-8 ml-1"
                                                        onClick={() => removeBentoItem(idx)}
                                                        title="Delete Card"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Left Column: Category & Route & Details */}
                                                <div className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-bold text-slate-700">
                                                            Select Category (Auto-sets Route)
                                                        </Label>
                                                        <Select
                                                            value={item.categorySlug || ""}
                                                            onValueChange={(selectedSlug) => {
                                                                if (selectedSlug === "__custom__") {
                                                                    updateBentoItem(idx, {
                                                                        categorySlug: "",
                                                                    });
                                                                    return;
                                                                }
                                                                const matched = (categories as any[]).find(
                                                                    (c) => c.slug === selectedSlug
                                                                );
                                                                updateBentoItem(idx, {
                                                                    categorySlug: selectedSlug,
                                                                    link: `/shop/${selectedSlug}`,
                                                                    title: item.title || matched?.name || "",
                                                                });
                                                            }}
                                                        >
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="Choose a category" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="__custom__">
                                                                    -- Custom Link (No Category) --
                                                                </SelectItem>
                                                                {(categories as any[]).map((cat) => (
                                                                    <SelectItem key={cat._id} value={cat.slug}>
                                                                        {cat.name} ({cat.slug})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-bold text-slate-700">
                                                            Target Route / Link
                                                        </Label>
                                                        <Input
                                                            value={item.link || ""}
                                                            placeholder="/shop/category-slug"
                                                            onChange={(e) =>
                                                                updateBentoItem(idx, { link: e.target.value })
                                                            }
                                                            className="bg-white"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold text-slate-700">
                                                                Card Title
                                                            </Label>
                                                            <Input
                                                                value={item.title}
                                                                placeholder="e.g. Korean Cosmetics"
                                                                onChange={(e) =>
                                                                    updateBentoItem(idx, { title: e.target.value })
                                                                }
                                                                className="bg-white"
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold text-slate-700">
                                                                Badge Text
                                                            </Label>
                                                            <Input
                                                                value={item.badge || ""}
                                                                placeholder="e.g. Premium Beauty"
                                                                onChange={(e) =>
                                                                    updateBentoItem(idx, { badge: e.target.value })
                                                                }
                                                                className="bg-white"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-bold text-slate-700">
                                                            Subtitle / Tagline
                                                        </Label>
                                                        <Input
                                                            value={item.subtitle || ""}
                                                            placeholder="e.g. 100% Authentic Korean Skincare"
                                                            onChange={(e) =>
                                                                updateBentoItem(idx, { subtitle: e.target.value })
                                                            }
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Right Column: Image Selector */}
                                                <div className="space-y-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-bold text-slate-700">
                                                            Card Background Image
                                                        </Label>
                                                        <ImageSelector
                                                            value={item.image}
                                                            onSelect={(val) =>
                                                                updateBentoItem(idx, { image: val })
                                                            }
                                                        />
                                                        <p className="text-[11px] text-muted-foreground mt-1">
                                                            Recommended size: 600x600px or larger high-resolution JPG/WebP
                                                        </p>
                                                    </div>

                                                    <div className="space-y-1.5 pt-2">
                                                        <Label className="text-xs font-bold text-slate-700">
                                                            Badge Color Theme
                                                        </Label>
                                                        <Select
                                                            value={item.badgeColor || "rose"}
                                                            onValueChange={(color) =>
                                                                updateBentoItem(idx, { badgeColor: color })
                                                            }
                                                        >
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="Badge Color" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="rose">Rose (Pink/Red)</SelectItem>
                                                                <SelectItem value="violet">Violet (Purple)</SelectItem>
                                                                <SelectItem value="amber">Amber (Gold/Yellow)</SelectItem>
                                                                <SelectItem value="emerald">Emerald (Green)</SelectItem>
                                                                <SelectItem value="blue">Blue</SelectItem>
                                                                <SelectItem value="red">Red</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );

    // --- Helpers ---

    function updateSlide(type: "desktop" | "mobile", idx: number, updates: Partial<THeroSlide>) {
        const field = type === "desktop" ? "heroSliderDesktop" : "heroSliderMobile";
        const newSlides = [...(formData![field] || [])];
        newSlides[idx] = { ...newSlides[idx], ...updates };
        setFormData({ ...formData!, [field]: newSlides });
    }

    function removeSlide(type: "desktop" | "mobile", idx: number) {
        const field = type === "desktop" ? "heroSliderDesktop" : "heroSliderMobile";
        const newSlides = formData![field]?.filter((_, i) => i !== idx);
        setFormData({ ...formData!, [field]: newSlides || [] });
    }

    function moveSlide(type: "desktop" | "mobile", idx: number, direction: number) {
        const field = type === "desktop" ? "heroSliderDesktop" : "heroSliderMobile";
        const newSlides = [...(formData![field] || [])];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= newSlides.length) return;
        [newSlides[idx], newSlides[targetIdx]] = [newSlides[targetIdx], newSlides[idx]];
        setFormData({ ...formData!, [field]: newSlides });
    }

    function updateFeature(idx: number, updates: Partial<THeroFeature>) {
        const newFeatures = [...(formData?.heroFeatures || [])];
        newFeatures[idx] = { ...newFeatures[idx], ...updates };
        setFormData({ ...formData!, heroFeatures: newFeatures });
    }

    function updateBentoGrid(updates: Partial<TBentoGrid>) {
        const current = formData?.bentoGrid || {
            isEnabled: true,
            tag: "Exclusive Selection",
            title: "Trending Collections",
            items: [],
        };
        setFormData({
            ...formData!,
            bentoGrid: { ...current, ...updates },
        });
    }

    function updateBentoItem(idx: number, updates: Partial<TBentoItem>) {
        const currentItems = [...(formData?.bentoGrid?.items || [])];
        currentItems[idx] = { ...currentItems[idx], ...updates };
        updateBentoGrid({ items: currentItems });
    }

    function addBentoItem() {
        const currentItems = [...(formData?.bentoGrid?.items || [])];
        currentItems.push({
            badge: "Hot Pick",
            title: "New Collection",
            subtitle: "Curated modern styles",
            image: "",
            link: "/shop",
        });
        updateBentoGrid({ items: currentItems });
    }

    function removeBentoItem(idx: number) {
        const currentItems = (formData?.bentoGrid?.items || []).filter((_, i) => i !== idx);
        updateBentoGrid({ items: currentItems });
    }

    function moveBentoItem(idx: number, direction: number) {
        const currentItems = [...(formData?.bentoGrid?.items || [])];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= currentItems.length) return;
        [currentItems[idx], currentItems[targetIdx]] = [currentItems[targetIdx], currentItems[idx]];
        updateBentoGrid({ items: currentItems });
    }
}


function ImageSelector({ value, onSelect }: { value: string, onSelect: (val: string) => void }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="flex-1">
                <Input value={value} onChange={(e) => onSelect(e.target.value)} placeholder="Image URL" />
            </div>
            <div className="w-20 h-10 relative border rounded overflow-hidden flex-shrink-0 bg-muted">
                {value && <Image src={value} alt="Preview" fill className="object-cover" unoptimized />}
            </div>
            <MediaLibrary
                onSelect={(files) => onSelect(files[0].url)}
                multiple={false}
                title="Select Image"
            />
        </div>
    );
}