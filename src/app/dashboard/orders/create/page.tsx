"use client";

import { useCreateOrderAdminMutation } from "@/components/Redux/RTK/orderApi";
import { useAdminProductsQuery } from "@/components/Redux/RTK/productApi";
import { CustomItemDialog } from "./_components/CustomItemDialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const orderFormSchema = z.object({
  customer_name: z.string().min(2, "Name is too short"),
  phone: z.string().min(11, "Phone must be at least 11 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  village_or_area: z.string().min(1, "Address is required"),
  upazila: z.string().min(1, "Upazila is required"),
  district: z.string().min(1, "District is required"),
  delivery_zone: z.enum(["inside_dhaka", "outside_dhaka"]),
  payment_method: z.enum(["COD", "ONLINE"]),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]),
  order_status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "canceled",
    "returned",
    "failed_delivery",
    "out_for_delivery",
  ]),
  delivery_charge: z.number().min(0),
  notes: z.string().optional(),
});

type SelectedProduct = {
  _id: string;
  product_id: string;
  variant_id: string | null;
  title: string;
  thumbnail: string | null;
  price: number;
  quantity: number;
  total_price: number;
  selected_variant_values?: Record<string, string>;
  available_variants?: any[];
};

export default function CreateOrderAdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCustomItemModalOpen, setIsCustomItemModalOpen] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );

  const { data: productsData, isLoading: isSearching } = useAdminProductsQuery({
    searchTerm,
    limit: 10,
  });

  const [createOrder, { isLoading: isCreating }] =
    useCreateOrderAdminMutation();

  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_name: "",
      phone: "",
      email: "",
      village_or_area: "",
      upazila: "",
      district: "",
      delivery_zone: "inside_dhaka",
      payment_method: "COD",
      payment_status: "pending",
      order_status: "pending",
      delivery_charge: 60,
      notes: "",
    },
  });

  const deliveryZone = form.watch("delivery_zone");

  useEffect(() => {
    if (deliveryZone === "inside_dhaka") {
      form.setValue("delivery_charge", 60);
    } else {
      form.setValue("delivery_charge", 120);
    }
  }, [deliveryZone, form]);

  const addProduct = (product: any) => {
    const existing = selectedProducts.find((p) => p.product_id === product._id);
    if (existing) {
      toast.info("Product already in list");
      return;
    }

    const newProduct: SelectedProduct = {
      _id: product._id, // Local ID in the list
      product_id: product._id,
      variant_id: null,
      title: product.product_title,
      thumbnail: product.thumbnail,
      price: product.product_price,
      quantity: 1,
      total_price: product.product_price,
      available_variants: product.product_variants || [],
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setSearchTerm("");
    toast.success("Product added");
  };

  const handleAddCustomItem = (item: { title: string; price: number; thumbnail: string }) => {
    const newProduct: SelectedProduct = {
      _id: `custom-${Date.now()}`,
      product_id: `custom-${Date.now()}`,
      variant_id: null,
      title: item.title,
      thumbnail: item.thumbnail,
      price: item.price,
      quantity: 1,
      total_price: item.price,
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    toast.success("Custom item added");
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.product_id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        if (p.product_id === id) {
          const newQty = Math.max(1, p.quantity + delta);
          return {
            ...p,
            quantity: newQty,
            total_price: p.price * newQty,
          };
        }
        return p;
      })
    );
  };

  const updateVariant = (id: string, variantId: string) => {
    setSelectedProducts(
      selectedProducts.map((p) => {
        if (p.product_id === id) {
          const variant = p.available_variants?.find(
            (v) => v._id === variantId
          );
          if (variant) {
            return {
              ...p,
              variant_id: variantId,
              price: variant.variant_price,
              total_price: variant.variant_price * p.quantity,
              selected_variant_values: variant.variant_option_values
                ? (variant.variant_option_values instanceof Map
                  ? Object.fromEntries(variant.variant_option_values)
                  : variant.variant_option_values)
                : {},
            };
          }
        }
        return p;
      })
    );
  };

  const calculateSubtotal = () => {
    return selectedProducts.reduce((sum, p) => sum + p.total_price, 0);
  };

  const onSubmit = async (values: z.infer<typeof orderFormSchema>) => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const subtotal = calculateSubtotal();
    const finalData = {
      ...values,
      products: selectedProducts.map(p => ({
        product_id: p.product_id,
        variant_id: p.variant_id,
        title: p.title,
        thumbnail: p.thumbnail,
        price: p.price,
        quantity: p.quantity,
        total_price: p.total_price,
        selected_variant_values: p.selected_variant_values
      })),
      total_price: subtotal + values.delivery_charge
    };

    try {
      const res = await createOrder(finalData).unwrap();
      toast.success("Order created successfully!");
      router.push("/dashboard/orders");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create New Order
          </h1>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* LEFT: FORM FIELDS */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-md ring-1 ring-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      Customer Details
                    </CardTitle>
                    <CardDescription>
                      Basic information for the recipient.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="017XXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md ring-1 ring-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">
                      Shipping Address
                    </CardTitle>
                    <CardDescription>Where to deliver the goods.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="village_or_area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Village / Area / House</FormLabel>
                          <FormControl>
                            <Input placeholder="House 1, Road 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="upazila"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upazila</FormLabel>
                          <FormControl>
                            <Input placeholder="Mirpur" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input placeholder="Dhaka" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery_zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delivery Zone</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select zone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value="inside_dhaka">Inside Dhaka</SelectItem>
                              <SelectItem value="outside_dhaka">Outside Dhaka</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md ring-1 ring-slate-200 overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold">
                          Products Selection
                        </CardTitle>
                        <CardDescription>
                          Search and add items to this order.
                        </CardDescription>
                      </div>
                      <ShoppingCart className="text-slate-300 w-10 h-10 -rotate-12" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* SEARCH INPUT */}
                    <div className="p-4 border-b">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            placeholder="Search product (title or sku)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                          {/* SEARCH RESULTS POPOVER EFFECT */}
                          {searchTerm.length > 0 && productsData?.data && (
                            <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                              {productsData.data.map((p: any) => (
                                <button
                                  key={p._id}
                                  type="button"
                                  onClick={() => addProduct(p)}
                                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 border-b last:border-0 transition-colors"
                                >
                                  <img
                                    src={p.thumbnail}
                                    className="w-10 h-10 object-cover rounded border"
                                    alt=""
                                  />
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-800 text-sm">
                                      {p.product_title}
                                    </p>
                                    <p className="text-xs text-indigo-600 font-bold">
                                      ৳{p.product_price}
                                    </p>
                                  </div>
                                  <Plus className="w-4 h-4 text-slate-300" />
                                </button>
                              ))}
                              {productsData.data.length === 0 && (
                                <div className="p-4 text-center text-slate-500">
                                  No products found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCustomItemModalOpen(true)}
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold shrink-0"
                        >
                          + Custom Item
                        </Button>
                      </div>
                    </div>

                    {/* SELECTED PRODUCTS TABLE */}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/30">
                          <TableHead className="pl-6 w-12">#</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Variant</TableHead>
                          <TableHead className="text-center">QTY</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right pr-6">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProducts.map((p, index) => (
                          <TableRow key={p.product_id}>
                            <TableCell className="pl-6 text-slate-400 font-mono text-xs">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.thumbnail || ""}
                                  className="w-8 h-8 rounded border"
                                  alt=""
                                />
                                <span className="font-bold text-slate-700 text-xs">
                                  {p.title}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {p.available_variants &&
                                p.available_variants.length > 0 ? (
                                <Select
                                  onValueChange={(v) =>
                                    updateVariant(p.product_id, v)
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs min-w-[100px]">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    {p.available_variants.map((v: any) => {
                                      const values = v.variant_option_values
                                        ? (v.variant_option_values instanceof Map
                                          ? Object.values(Object.fromEntries(v.variant_option_values))
                                          : Object.values(v.variant_option_values))
                                        : [];
                                      return (
                                        <SelectItem key={v._id} value={v._id}>
                                          {values.join(" / ")} (${v.variant_price})
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-slate-400 text-xs italic">
                                  No variants
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(p.product_id, -1)}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold">
                                  {p.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(p.product_id, 1)}
                                  className="p-1 rounded bg-slate-100 hover:bg-slate-200"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs">
                              ৳{p.price}
                            </TableCell>
                            <TableCell className="text-right pr-6 font-bold text-indigo-600">
                              <div className="flex items-center justify-end gap-3">
                                ৳{p.total_price.toFixed(2)}
                                <button
                                  type="button"
                                  onClick={() => removeProduct(p.product_id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {selectedProducts.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="h-32 text-center text-slate-400"
                            >
                              Search and add products above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT: SETTINGS & SUMMARY */}
              <div className="space-y-6">
                <Card className="border-none shadow-md ring-1 ring-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      Order Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="order_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Global Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Order status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="canceled">Canceled</SelectItem>
                              <SelectItem value="returned">Returned</SelectItem>
                              <SelectItem value="failed_delivery">Failed Delivery</SelectItem>
                              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payment_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value="COD">Cash on Delivery</SelectItem>
                              <SelectItem value="ONLINE">Online Payment</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="payment_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="delivery_charge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manual Delivery Charge</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Internal Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Handle with care..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md ring-1 ring-slate-200 bg-slate-900 text-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-bold text-white">
                        ৳{calculateSubtotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
                      <span>Delivery</span>
                      <span className="font-bold text-white">
                        ৳{form.watch("delivery_charge").toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold">Total</span>
                      <span className="text-3xl font-black text-indigo-400">
                        ৳ {(calculateSubtotal() + form.watch("delivery_charge")).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-12"
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Create Order"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* CUSTOM ITEM DIALOG */}
      <CustomItemDialog
        isOpen={isCustomItemModalOpen}
        onOpenChange={setIsCustomItemModalOpen}
        onAdd={handleAddCustomItem}
      />
    </div>
  );
}
