import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { ProductFormValues } from "@/lib/validators/productSchema"
import type { UseFormReturn } from "react-hook-form"
import { useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const INITIAL_COUNTRIES = [
    "Bangladesh",
    "Korea",
    "China",
    "India",
    "Vietnam",
    "Turkey",
    "USA",
    "UK",
]

import { Checkbox } from "@/components/ui/checkbox"

export default function PhysicalDetailsCard({
    form,
}: {
    form: UseFormReturn<ProductFormValues>
}) {
    const isFreeDelivery = form.watch("is_free_delivery")
    const [countryOpen, setCountryOpen] = useState(false)
    const [countrySearch, setCountrySearch] = useState("")
    const [countries, setCountries] = useState(INITIAL_COUNTRIES)

    // Ensure the current value is in the suggestions if it's not a standard one
    useEffect(() => {
        const currentValue = form.getValues("country_of_origin")
        if (currentValue && !countries.includes(currentValue)) {
            setCountries(prev => [...prev, currentValue])
        }
    }, [form])

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Physical Product Details</h3>
                <p className="text-sm text-muted-foreground">Shipping and origin information.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="country_of_origin"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Country of Origin</FormLabel>
                            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
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
                                            {field.value || "Select country"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-white" align="start">
                                    <div className="flex flex-col">
                                        <div className="p-2 border-b flex items-center gap-2">
                                            <Input
                                                placeholder="Search country..."
                                                value={countrySearch}
                                                onChange={(e) => setCountrySearch(e.target.value)}
                                                className="h-8 text-xs flex-1"
                                            />
                                            {countrySearch && !countries.some(c => c.toLowerCase() === countrySearch.toLowerCase()) && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[10px] px-2 gap-1 border-primary/20 text-primary hover:bg-primary/5"
                                                    onClick={() => {
                                                        const newCountry = countrySearch.trim()
                                                        if (!countries.includes(newCountry)) {
                                                            setCountries(prev => [...prev, newCountry])
                                                        }
                                                        form.setValue("country_of_origin", newCountry)
                                                        setCountryOpen(false)
                                                        setCountrySearch("")
                                                    }}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                    Add
                                                </Button>
                                            )}
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto p-1">
                                            {countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).length > 0 ? (
                                                countries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map((country) => (
                                                    <div
                                                        key={country}
                                                        className="flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-slate-100 cursor-pointer transition-colors"
                                                        onClick={() => {
                                                            form.setValue("country_of_origin", country)
                                                            setCountryOpen(false)
                                                            setCountrySearch("")
                                                        }}
                                                    >
                                                        <Check className={cn("h-4 w-4 text-primary", field.value === country ? "opacity-100" : "opacity-0")} />
                                                        <span className="truncate">{country}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-muted-foreground italic">
                                                    No countries found.
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

                <FormField
                    control={form.control}
                    name="is_free_delivery"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 mt-8">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked)
                                        if (checked) {
                                            form.setValue("delivery_charge.inside_dhaka", 0)
                                            form.setValue("delivery_charge.outside_dhaka", 0)
                                        }
                                    }}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">Free Delivery</FormLabel>
                                <p className="text-[10px] text-muted-foreground">Sets shipping charges to 0.</p>
                            </div>


                        </FormItem>
                    )}
                />
            </div>

            {!isFreeDelivery && (
                <div className="border rounded-md p-4 space-y-4 animate-in fade-in duration-300">
                    <h4 className="font-semibold text-sm">Delivery Charge</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="delivery_charge.inside_dhaka"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Inside Dhaka</FormLabel>
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
                            name="delivery_charge.outside_dhaka"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Outside Dhaka</FormLabel>
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
                    </div>
                </div>
            )}
        </div>
    )
}
