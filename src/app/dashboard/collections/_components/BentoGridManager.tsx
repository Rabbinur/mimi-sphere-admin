"use client";

import { useGetCmsQuery, useUpdateCmsMutation } from "@/components/Redux/RTK/cmsApi";
import { useAllCategoryQuery } from "@/components/Redux/RTK/categoryApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaLibrary } from "@/components/ui/media-manager";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TBentoGrid, TBentoItem } from "@/types";
import { MoveDown, MoveUp, Plus, Trash2, Save, LayoutGrid } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function ImageSelector({ value, onSelect }: { value: string; onSelect: (val: string) => void }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="flex-1">
                <Input
                    value={value || ""}
                    onChange={(e) => onSelect(e.target.value)}
                    placeholder="Image URL"
                    className="bg-white"
                />
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

export default function BentoGridManager() {
    const { data: cmsResponse, isLoading: isCmsLoading } = useGetCmsQuery();
    const { data: categories = [] } = useAllCategoryQuery(false);
    const [updateCms, { isLoading: isUpdating }] = useUpdateCmsMutation();

    const [bentoGrid, setBentoGrid] = useState<TBentoGrid>({
        isEnabled: true,
        tag: "Handpicked For You",
        title: "Signature Collections",
        items: [],
    });

    useEffect(() => {
        if (cmsResponse?.data?.bentoGrid) {
            setBentoGrid({
                isEnabled: cmsResponse.data.bentoGrid.isEnabled ?? true,
                tag: cmsResponse.data.bentoGrid.tag || "Handpicked For You",
                title: cmsResponse.data.bentoGrid.title || "Signature Collections",
                items: cmsResponse.data.bentoGrid.items || [],
            });
        }
    }, [cmsResponse]);

    const toggleBentoVisibility = async (checked: boolean) => {
        updateBentoGridState({ isEnabled: checked });
        if (cmsResponse?.data) {
            try {
                await updateCms({
                    ...cmsResponse.data,
                    bentoGrid: {
                        ...(cmsResponse.data.bentoGrid || bentoGrid),
                        isEnabled: checked,
                    },
                }).unwrap();
                toast.success(
                    checked
                        ? "Best Collections (Bento) section is now VISIBLE on homepage!"
                        : "Best Collections (Bento) section is now HIDDEN from homepage!"
                );
            } catch {
                toast.error("Failed to update Bento Grid visibility");
            }
        }
    };

    const handleSave = async () => {
        if (!cmsResponse?.data) return;
        try {
            const updatedCmsData = {
                ...cmsResponse.data,
                bentoGrid,
            };
            await updateCms(updatedCmsData).unwrap();
            toast.success("Best Collections (Bento) updated successfully!");
        } catch (error) {
            toast.error("Failed to update Best Collections settings");
        }
    };

    const updateBentoGridState = (updates: Partial<TBentoGrid>) => {
        setBentoGrid((prev) => ({ ...prev, ...updates }));
    };

    const updateItem = (idx: number, updates: Partial<TBentoItem>) => {
        const newItems = [...(bentoGrid.items || [])];
        newItems[idx] = { ...newItems[idx], ...updates };
        updateBentoGridState({ items: newItems });
    };

    const addItem = () => {
        const newItems = [...(bentoGrid.items || [])];
        newItems.push({
            badge: "Hot Pick",
            badgeColor: "rose",
            title: "New Collection",
            subtitle: "Curated modern styles",
            image: "",
            link: "/shop",
            categorySlug: "",
        });
        updateBentoGridState({ items: newItems });
    };

    const removeItem = (idx: number) => {
        const newItems = (bentoGrid.items || []).filter((_, i) => i !== idx);
        updateBentoGridState({ items: newItems });
    };

    const moveItem = (idx: number, direction: number) => {
        const newItems = [...(bentoGrid.items || [])];
        const targetIdx = idx + direction;
        if (targetIdx < 0 || targetIdx >= newItems.length) return;
        [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
        updateBentoGridState({ items: newItems });
    };

    if (isCmsLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Loading Collections settings...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Action Row for Bento Tab: Toggle on Left of Save Changes Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                    Customize the Bento Grid collection cards and toggle the Bento Grid section on/off on the homepage.
                </p>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Tab-wise Section Visibility Toggle */}
                    <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg shadow-sm">
                        <Label htmlFor="bento-tab-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                            Section:
                        </Label>
                        <Switch
                            id="bento-tab-toggle"
                            checked={bentoGrid.isEnabled}
                            onCheckedChange={toggleBentoVisibility}
                            disabled={isUpdating}
                        />
                        <span className={`text-xs font-bold ${bentoGrid.isEnabled ? 'text-green-600' : 'text-red-500'}`}>
                            {bentoGrid.isEnabled ? "Visible" : "Hidden"}
                        </span>
                    </div>

                    <Button onClick={handleSave} disabled={isUpdating} className="gap-1.5">
                        <Save className="w-4 h-4" />
                        {isUpdating ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </div>

            {/* Best Collections (Bento Grid) Section Card */}
            <Card className="border shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-primary" />
                            <CardTitle className="text-lg">Best Collections (Bento Grid) Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Configure the 4-card interactive Bento Grid layout shown on the storefront homepage.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-4">
                    {/* Section Header Controls */}
                    <div className="p-4 bg-muted/20 border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs">Bento Section Subtitle / Tag</Label>
                            <Input
                                value={bentoGrid.tag || ""}
                                placeholder="e.g. Handpicked For You"
                                onChange={(e) => updateBentoGridState({ tag: e.target.value })}
                                className="bg-white"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Small uppercase tag displayed above the title (e.g. Handpicked For You)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs">Bento Section Headline / Title</Label>
                            <Input
                                value={bentoGrid.title || ""}
                                placeholder="e.g. Signature Collections"
                                onChange={(e) => updateBentoGridState({ title: e.target.value })}
                                className="bg-white"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Main section headline displayed on storefront (e.g. Signature Collections)
                            </p>
                        </div>
                    </div>

                    {/* Cards Header & Add Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                        <div>
                            <h3 className="text-base font-bold text-slate-800">
                                Bento Cards ({(bentoGrid.items || []).length})
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Card #1 is the featured Hero card. Card #4 is the wide banner card.
                            </p>
                        </div>
                        <Button type="button" size="sm" onClick={addItem} className="gap-1.5">
                            <Plus className="w-4 h-4" /> Add Bento Card
                        </Button>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-4">
                        {(bentoGrid.items || []).length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/10">
                                <p className="text-sm text-muted-foreground mb-3">
                                    No bento cards added yet.
                                </p>
                                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                                    <Plus className="w-4 h-4 mr-1.5" /> Add First Card
                                </Button>
                            </div>
                        ) : (
                            (bentoGrid.items || []).map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-5 border rounded-xl space-y-4 bg-muted/20 relative shadow-sm hover:border-primary/40 transition-colors"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-center justify-between border-b pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md">
                                                Card #{idx + 1}
                                            </span>
                                            {idx === 0 && (
                                                <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded border border-rose-200">
                                                    ★ Featured Hero Card
                                                </span>
                                            )}
                                            {idx === 3 && (
                                                <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-200">
                                                    ★ Wide Bottom Banner
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
                                                onClick={() => moveItem(idx, -1)}
                                                title="Move Up"
                                            >
                                                <MoveUp className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                disabled={idx === (bentoGrid.items || []).length - 1}
                                                onClick={() => moveItem(idx, 1)}
                                                title="Move Down"
                                            >
                                                <MoveDown className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8 ml-1"
                                                onClick={() => removeItem(idx)}
                                                title="Delete Card"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Card Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Left Side: Category Route & Copy */}
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-slate-700">
                                                    Select Category (Auto-sets Route)
                                                </Label>
                                                <Select
                                                    value={item.categorySlug || ""}
                                                    onValueChange={(selectedSlug) => {
                                                        if (selectedSlug === "__custom__") {
                                                            updateItem(idx, {
                                                                categorySlug: "",
                                                            });
                                                            return;
                                                        }
                                                        const matched = (categories as any[]).find(
                                                            (c) => c.slug === selectedSlug
                                                        );
                                                        updateItem(idx, {
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
                                                    Target Route / URL Link
                                                </Label>
                                                <Input
                                                    value={item.link || ""}
                                                    placeholder="/shop/category-slug"
                                                    onChange={(e) =>
                                                        updateItem(idx, { link: e.target.value })
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
                                                            updateItem(idx, { title: e.target.value })
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
                                                            updateItem(idx, { badge: e.target.value })
                                                        }
                                                        className="bg-white"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-slate-700">
                                                    Subtitle / Description
                                                </Label>
                                                <Input
                                                    value={item.subtitle || ""}
                                                    placeholder="e.g. 100% Authentic Korean Skincare"
                                                    onChange={(e) =>
                                                        updateItem(idx, { subtitle: e.target.value })
                                                    }
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Side: Image & Color */}
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-bold text-slate-700">
                                                    Card Background Image
                                                </Label>
                                                <ImageSelector
                                                    value={item.image}
                                                    onSelect={(val) =>
                                                        updateItem(idx, { image: val })
                                                    }
                                                />
                                                <p className="text-[11px] text-muted-foreground">
                                                    Select an image from Media Library (recommended min 600x600px).
                                                </p>
                                            </div>

                                            <div className="space-y-1.5 pt-2">
                                                <Label className="text-xs font-bold text-slate-700">
                                                    Badge Color Theme
                                                </Label>
                                                <Select
                                                    value={item.badgeColor || "rose"}
                                                    onValueChange={(color) =>
                                                        updateItem(idx, { badgeColor: color })
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

                    {/* Bottom Save Bar */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={handleSave} disabled={isUpdating} className="gap-2">
                            <Save className="w-4 h-4" />
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
