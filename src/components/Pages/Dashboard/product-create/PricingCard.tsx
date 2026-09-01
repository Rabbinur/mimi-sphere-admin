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
                {/* Price */}
                <div className="grid grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="product_price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (৳)*</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
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
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>Original price for discount display</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />




                </div>

                {/* Cost */}



            </CardContent>
        </Card>
    )
}
