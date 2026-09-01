"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { UseFormReturn } from "react-hook-form"

export default function DiscoverySettingsCard({
    form,
}: {
    form: UseFormReturn<ProductFormValues>
}) {
    return (
        <div className="rounded-lg border bg-card p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Discovery Settings
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
                            <FormLabel className="text-sm font-medium">Featured Product</FormLabel>
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
                            <FormLabel className="text-sm font-medium">Trendy Product</FormLabel>
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
                            <FormLabel className="text-sm font-medium">Limited-Time Offer</FormLabel>
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
                            <FormLabel className="text-sm font-medium">Pre-order Product</FormLabel>
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
    )
}
