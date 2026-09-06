"use client"

import React, { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Tag, X } from "lucide-react"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { UseFormReturn } from "react-hook-form"

export default function DiscoverySettingsCard({
    form,
}: {
    form: UseFormReturn<ProductFormValues>
}) {
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && "key" in e && e.key !== "Enter") return;
        if (e) e.preventDefault();

        const cleanTag = tagInput.trim().replace(/,$/, "");
        if (!cleanTag) return;

        const currentTags = form.getValues("tags") || [];
        if (!currentTags.includes(cleanTag)) {
            form.setValue("tags", [...currentTags, cleanTag]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = form.getValues("tags") || [];
        form.setValue("tags", currentTags.filter((t) => t !== tagToRemove));
    };

    const handleGenerateSEO = () => {
        const title = form.getValues("product_title");
        if (!title) {
            alert("Please enter a Product Title first to generate SEO data.");
            return;
        }

        const seoTitle = `Buy ${title} | Premium Quality - MIMI SPHERE`;
        const seoDesc = `Shop ${title} online at MIMI SPHERE. Enjoy the best prices, premium authenticity, secure checkout, and fast nationwide delivery. Order yours today!`;

        form.setValue("seo_title", seoTitle.substring(0, 70));
        form.setValue("seo_description", seoDesc.substring(0, 160));

        // Auto tags from words in title
        const words = title
            .toLowerCase()
            .split(" ")
            .filter((w) => w.length > 2);
        const currentTags = form.getValues("tags") || [];
        const combined = Array.from(new Set([...currentTags, title.toLowerCase(), ...words])).slice(0, 10);
        form.setValue("tags", combined);
    };

    const tags = form.watch("tags") || [];

    return (
        <div className="space-y-4">
            {/* SEO & Search Discovery Card */}
            <div className="rounded-lg border bg-card p-4 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                        SEO & Search Engine Optimization
                    </h3>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateSEO}
                        className="h-7 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5"
                    >
                        <Sparkles size={13} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">AI SEO Generate</span>
                    </Button>
                </div>

                {/* SEO Title */}
                <FormField
                    control={form.control}
                    name="seo_title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-semibold">Meta Page Title (Max 70 chars)</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Buy Premium Cotton T-Shirt Online"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* SEO Description */}
                <FormField
                    control={form.control}
                    name="seo_description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-semibold">Meta Description (Max 160 chars)</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={2}
                                    placeholder="Brief search engine preview description..."
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Search Tags */}
                <div className="space-y-2 pt-1">
                    <FormLabel className="text-xs font-semibold">Search Tags / Keywords</FormLabel>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Type a tag and press Enter..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddTag();
                                }
                            }}
                            className="h-8 text-xs"
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleAddTag}
                            className="h-8 px-3 text-xs bg-slate-900 text-white hover:bg-slate-800"
                        >
                            Add
                        </Button>
                    </div>

                    {/* Tag Pills */}
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {tags.map((t) => (
                                <span
                                    key={t}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md text-[11px] font-bold border border-slate-200"
                                >
                                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                                    <span>{t}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveTag(t)}
                                        className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Discovery Settings Badges */}
            <div className="rounded-lg border bg-card p-4 space-y-4 shadow-2xs">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Store Discovery & Visibility
                </h3>

                <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs font-medium cursor-pointer">Featured Product</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_trendy"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs font-medium cursor-pointer">Trendy Product</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_limited_time_offer"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs font-medium cursor-pointer">Limited-Time Offer</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_pre_order"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-xs font-medium cursor-pointer">Pre-order Product</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                {form.watch("is_pre_order") && (
                    <FormField
                        control={form.control}
                        name="pre_order_message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Pre-order Message</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="Shipping within (10 - 20) days"
                                        className="h-9"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                )}
            </div>
        </div>
    )
}
