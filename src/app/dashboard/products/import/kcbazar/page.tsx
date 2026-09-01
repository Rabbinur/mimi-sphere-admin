"use client";

import { ArrowLeft, ChevronRight, Loader2, Search } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import BasicInfoCard from "@/components/Pages/Dashboard/product-create/BasicInfoCard";
import CategoryCard from "@/components/Pages/Dashboard/product-create/CategoryCard";
import DiscoverySettingsCard from "@/components/Pages/Dashboard/product-create/DiscoverySettingsCard";
import InventoryCard from "@/components/Pages/Dashboard/product-create/InventoryCard";
import OptionsVariantsCard from "@/components/Pages/Dashboard/product-create/OptionsVariantsCard";
import PhysicalDetailsCard from "@/components/Pages/Dashboard/product-create/PhysicalDetailsCard";
import PricingCard from "@/components/Pages/Dashboard/product-create/PricingCard";

import { useCreateProductMutation, useImportKcbazarProductMutation } from "@/components/Redux/RTK/productApi";
import { type ProductFormValues, productResolver } from "@/lib/validators/productSchema";

export interface ScrapedProduct {
  title: string;
  price: number;
  regular_price?: number;
  description: string;
  images: string[];
  thumbnail: string;
  sku: string;
  brand: string;
  categories: string[];
  attributes: { label: string; value: string }[];
}

const KcbazarImporter: React.FC = () => {
  const [productUrl, setProductUrl] = useState<string>("");
  const [createProduct, { isLoading: isSaving }] = useCreateProductMutation();
  const [importKcbazarProduct, { isLoading: fetching }] = useImportKcbazarProductMutation();
  const [scrapedData, setScrapedData] = useState<ScrapedProduct | null>(null);

  // Form logic
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [optionValue, setOptionValue] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: productResolver,
    defaultValues: {
      product_title: "",
      product_description: "",
      thumbnail: "",
      product_images: [],
      product_price: 0,
      compare_at_price: 0,
      sku: "",
      quantity: 100,
      moq: 1,
      product_categories: [],
      product_status: "active",
      delivery_charge: {
        inside_dhaka: 60,
        outside_dhaka: 120,
      },
      is_featured: false,
      is_trendy: false,
      is_limited_time_offer: false,
      is_pre_order: false,
      pre_order_message: "",
      country_of_origin: "",
      product_options: [],
      product_variants: [],
    },
  });

  const convertToInternal = (data: ScrapedProduct) => {
    return {
      product_title: data.title,
      product_description: data.description,
      thumbnail: data.thumbnail,
      product_images: data.images,
      product_price: data.price,
      compare_at_price: data.regular_price || data.price,
      sku: data.sku,
      quantity: 100,
      moq: 1,
      product_categories: [],
      product_vendor: data.brand || "",
      product_status: "active" as "active" | "draft",
      country_of_origin: "Korea",
      delivery_charge: {
        inside_dhaka: 60,
        outside_dhaka: 120,
      },
      product_options: [],
      product_variants: [],
      product_attributes: data.attributes,
      is_featured: false,
      is_trendy: false,
      is_limited_time_offer: false,
      is_pre_order: false,
      pre_order_message: "",
    };
  };

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productUrl) {
      toast.error("Please enter a product URL");
      return;
    }

    try {
      const response = await importKcbazarProduct({ url: productUrl }).unwrap();

      const data = response.data;
      setScrapedData(data);
      const converted = convertToInternal(data);

      // Update form
      form.reset(converted);

      toast.success("Product data fetched!");
    } catch (error: any) {
      console.error("Error fetching product:", error);
      toast.error(error?.data?.message || "Failed to fetch product");
    }
  };

  async function onSubmit(data: ProductFormValues) {
    try {
      const payload: any = { ...data };
      
      // Ensure prices are numbers
      payload.product_price = Number(payload.product_price);
      payload.compare_at_price = Number(payload.compare_at_price);

      const response = await createProduct({ data: payload }).unwrap();
      if (response.success) {
        toast.success("Product imported and saved successfully");
        setScrapedData(null);
        setProductUrl("");
        form.reset();
      } else {
        toast.error("Error saving product");
      }
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error?.data?.message || "Failed to save product");
    }
  }

  // Helper functions for Options/Variants card (if needed manually)
  const addOption = () => setOptions([...options, { name: "", values: [] }]);
  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };
  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };
  const addOptionValue = (optionIndex: number) => {
    if (!optionValue) return;
    const newOptions = [...options];
    newOptions[optionIndex].values.push(optionValue);
    setOptions(newOptions);
    setOptionValue("");
  };
  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const newOptions = [...options];
    newOptions[optionIndex].values.splice(valueIndex, 1);
    setOptions(newOptions);
  };
  const generateVariants = (optionsList: { name: string; values: string[] }[]) => {
      // Manual generation if needed
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/products" className="rounded-md p-1 hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Products</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Import KCBazar Product</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 px-4 lg:px-8 pb-20">
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl font-bold mb-4">Import from KCBazar</h2>
          <form onSubmit={handleFetch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter KCBazar Product URL"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={fetching}>
              {fetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {fetching ? "Fetching..." : "Fetch Product"}
            </Button>
          </form>
        </div>

        {scrapedData && (
          <Form {...form}>
            <form className="grid grid-cols-1 gap-8 lg:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="lg:col-span-2 space-y-8">
                <section className="p-4 border rounded-lg bg-pink-50/50 border-pink-100 space-y-4">
                  <h3 className="text-sm font-semibold text-pink-700">Scraped Reference (KCBazar)</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Original Title</p>
                      <p className="font-medium truncate" title={scrapedData.title}>{scrapedData.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Original Price</p>
                      <p className="font-medium text-pink-600">
                        ৳ {scrapedData.price}
                      </p>
                    </div>
                  </div>

                  {form.watch("product_attributes") && form.watch("product_attributes")!.length > 0 && (
                    <div className="pt-2 border-t border-pink-100">
                      <p className="text-xs font-semibold text-pink-600 mb-2 uppercase tracking-wider">Specifications</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                        {form.watch("product_attributes")?.map((attr, i) => (
                          <div key={i} className="flex justify-between border-b border-pink-50 pb-1">
                            <span className="text-muted-foreground">{attr.label}</span>
                            <span className="font-medium text-right">{attr.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <BasicInfoCard form={form} />
                <PricingCard form={form} />

                <OptionsVariantsCard
                  options={options}
                  optionValue={optionValue}
                  setOptionValue={setOptionValue}
                  addOption={addOption}
                  removeOption={removeOption}
                  updateOptionName={updateOptionName}
                  addOptionValue={addOptionValue}
                  removeOptionValue={removeOptionValue}
                  variants={variants}
                  setVariants={setVariants}
                  generateVariants={generateVariants}
                  form={form}
                />
              </div>

              <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Status</h3>
                  <Badge variant={form.watch("product_status") === "active" ? "default" : "secondary"}>
                    {form.watch("product_status")}
                  </Badge>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <InventoryCard form={form} />
                </div>

                <DiscoverySettingsCard form={form} />

                <CategoryCard form={form} />

                <div className="rounded-lg border bg-card p-4">
                  <PhysicalDetailsCard form={form} />
                </div>

                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isSaving ? "Saving Product..." : "Save Imported Product"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setScrapedData(null)}>
                    Discard
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};

export default KcbazarImporter;