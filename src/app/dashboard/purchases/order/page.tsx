"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Upload, Search } from "lucide-react";
import { toast } from "sonner";
import { useCreatePurchaseMutation } from "@/components/Redux/RTK/purchaseApi";
import { useAllSuppliersQuery } from "@/components/Redux/RTK/supplierApi";
import { useGetPosProductsQuery } from "@/components/Redux/RTK/posApi";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  
  // API Queries
  const { data: suppliersData, isLoading: isLoadingSuppliers } = useAllSuppliersQuery("");
  const { data: productsData, isLoading: isLoadingProducts } = useGetPosProductsQuery({});
  const [createPurchase, { isLoading: isSubmitting }] = useCreatePurchaseMutation();

  const suppliers = suppliersData?.data || [];
  
  let products = [];
  if (productsData?.data && Array.isArray(productsData.data)) {
      products = productsData.data;
  } else if (Array.isArray(productsData)) {
      products = productsData;
  }

  // Form State
  const [formData, setFormData] = useState({
    supplierId: "",
    reference: `PO-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split("T")[0],
    status: "Received" as any,
    paidAmount: 0,
    paymentStatus: "Paid" as any,
    chalanImage: ""
  });

  const [items, setItems] = useState<any[]>([]);

  // Search product
  const [productSearch, setProductSearch] = useState("");
  
  const handleAddProduct = (product: any) => {
    const exists = items.find(i => i.productId === product.product_id);
    if (exists) {
      toast.info("Product already in list");
      return;
    }
    setItems([...items, {
      productId: product.product_id,
      productName: product.product_name,
      quantity: 1,
      unitPrice: product.cost_price || product.price || 0,
      total: product.cost_price || product.price || 0
    }]);
    setProductSearch("");
  };

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = qty;
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].unitPrice = price;
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const grandTotal = items.reduce((acc, curr) => acc + curr.total, 0);
  const dueAmount = Math.max(0, grandTotal - formData.paidAmount);

  // Auto update payment status based on paid vs due
  React.useEffect(() => {
    if (dueAmount === 0 && grandTotal > 0) {
      setFormData(prev => ({ ...prev, paymentStatus: "Paid" }));
    } else if (formData.paidAmount === 0) {
      setFormData(prev => ({ ...prev, paymentStatus: "Unpaid" }));
    } else {
      setFormData(prev => ({ ...prev, paymentStatus: "Overdue" })); // or partial
    }
  }, [grandTotal, formData.paidAmount, dueAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierId) {
      return toast.error("Please select a supplier");
    }
    if (items.length === 0) {
      return toast.error("Please add at least one product");
    }

    const payload = {
      ...formData,
      subTotal: grandTotal,
      grandTotal: grandTotal,
      dueAmount: dueAmount,
      items: items.map(it => ({
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total
      }))
    };

    try {
      await createPurchase(payload).unwrap();
      toast.success("Purchase Order created successfully!");
      router.push("/dashboard/purchases");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create purchase");
    }
  };

  // Cloudinary Widget Helper (assuming they have next-cloudinary or similar, otherwise simple prompt for URL for now)
  const handleImageUpload = () => {
    const url = prompt("Please enter the Chalan Image URL (Cloudinary URL):");
    if (url) {
      setFormData({ ...formData, chalanImage: url });
      toast.success("Chalan attached");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 pb-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create Purchase</h1>
          <p className="text-sm text-slate-500 font-normal">Add new purchase order and update stock</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Supplier *</label>
              <select 
                required 
                value={formData.supplierId} 
                onChange={e => setFormData({...formData, supplierId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500 bg-white"
              >
                <option value="">Select a Supplier</option>
                {suppliers.map((sup: any) => (
                  <option key={sup._id} value={sup._id}>{sup.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Reference / Chalan No *</label>
              <input 
                required 
                type="text" 
                value={formData.reference} 
                onChange={e => setFormData({...formData, reference: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date *</label>
              <input 
                required 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status *</label>
              <select 
                required 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500 bg-white"
              >
                <option value="Received">Received (Updates Stock)</option>
                <option value="Pending">Pending (No Stock Update)</option>
                <option value="Ordered">Ordered (No Stock Update)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-slate-700 border-b pb-2">Order Items</h2>
          
          <div className="relative mb-4 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products to add..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-orange-500"
            />
            {/* Simple dropdown for searching products */}
            {productSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {products
                  .filter((p: any) => p.product_name.toLowerCase().includes(productSearch.toLowerCase()))
                  .slice(0, 5)
                  .map((p: any) => (
                    <div 
                      key={p.product_id} 
                      onClick={() => handleAddProduct(p)}
                      className="p-3 hover:bg-slate-50 cursor-pointer text-sm border-b last:border-b-0 flex justify-between"
                    >
                      <span>{p.product_name}</span>
                      <span className="text-slate-500 text-xs">Stock: {p.quantity}</span>
                    </div>
                ))}
              </div>
            )}
          </div>

          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-y">
                <th className="p-3">Product Name</th>
                <th className="p-3 w-32">Unit Price (৳)</th>
                <th className="p-3 w-32">Quantity</th>
                <th className="p-3 w-32">Subtotal (৳)</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 italic">No products added yet.</td>
                </tr>
              ) : items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-3 font-medium">{item.productName}</td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="0" 
                      value={item.unitPrice} 
                      onChange={e => updateItemPrice(idx, Number(e.target.value))}
                      className="w-full p-2 border rounded outline-none focus:border-orange-500"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={e => updateItemQty(idx, Number(e.target.value))}
                      className="w-full p-2 border rounded outline-none focus:border-orange-500"
                    />
                  </td>
                  <td className="p-3 font-bold text-slate-700">{item.total.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-700 border-b pb-2">Attachment</h2>
            
            {!formData.chalanImage ? (
              <button 
                type="button" 
                onClick={handleImageUpload}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-orange-500 hover:border-orange-300 transition-colors"
              >
                <Upload className="w-8 h-8 mb-2" />
                <span className="font-semibold text-sm">Upload Chalan Image</span>
                <span className="text-xs mt-1">Provide Cloudinary URL</span>
              </button>
            ) : (
              <div className="relative w-full rounded-xl overflow-hidden border">
                <img src={formData.chalanImage} alt="Chalan" className="w-full h-48 object-cover" />
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, chalanImage: ""})}
                  className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-rose-500 hover:bg-rose-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-700 border-b pb-2">Payment Details</h2>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Grand Total:</span>
              <span className="font-bold text-lg text-slate-800">৳{grandTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center gap-4 text-sm">
              <span className="text-slate-600 w-1/3">Paid Amount (৳):</span>
              <input 
                type="number" 
                min="0"
                max={grandTotal}
                value={formData.paidAmount} 
                onChange={e => setFormData({...formData, paidAmount: Number(e.target.value)})}
                className="w-2/3 px-3 py-2 border rounded-lg outline-none focus:border-orange-500 font-bold"
              />
            </div>
            
            <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed">
              <span className="text-slate-600">Due Amount:</span>
              <span className="font-bold text-lg text-rose-600">৳{dueAmount.toLocaleString()}</span>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Complete Purchase"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
