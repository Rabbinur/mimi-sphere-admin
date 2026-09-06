"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { UseFormReturn } from "react-hook-form"

export default function PricingCard({
    form,
}: {
    form: UseFormReturn<ProductFormValues>
}) {
    return (
        <Card className=" p-2 md:p-4 shadow-sm rounded-md">
            <CardHeader className="p-2 md:p-4">
                <CardTitle>Pricing Information</CardTitle>
                <CardDescription>Set pricing and delivery charges for this product.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-2 md:p-4">
                {/* Price & Cost Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="product_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sale Price (৳)*</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>Customer selling price in POS/Web</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="compare_at_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Compare at Price (৳)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>Original strike-through price</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="cost_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cost per Item (৳)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>Your purchase/supplier cost</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Real-time Profit & Margin Indicator */}
                {(() => {
                    const price = Number(form.watch("product_price")) || 0;
                    const cost = Number(form.watch("cost_price")) || 0;
                    if (price > 0 && cost > 0) {
                        const profit = price - cost;
                        const margin = ((profit / price) * 100).toFixed(1);
                        const isProfitable = profit >= 0;

                        return (
                            <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                                isProfitable ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
                            }`}>
                                <span>Profit per item: <strong className="font-mono text-sm">৳{profit.toFixed(2)}</strong></span>
                                <span>Profit Margin: <strong className="font-mono text-sm">{margin}%</strong></span>
                            </div>
                        );
                    }
                    return null;
                })()}
            </CardContent>
        </Card>
    )
}
