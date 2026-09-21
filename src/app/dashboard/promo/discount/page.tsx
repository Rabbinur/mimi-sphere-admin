"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileText,
  FileSpreadsheet,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  Package,
  Globe,
  Tag,
  Calendar,
  Layers,
  AlertCircle,
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import {
  useGetAllDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  IDiscountItem,
} from "@/components/Redux/RTK/discountApi";
import { useAllProductsQuery } from "@/components/Redux/RTK/productApi";
import { toast } from "sonner";

const DAYS_OF_WEEK = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

export default function DiscountPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Query Backend for Discounts
  const {
    data: discountResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllDiscountsQuery({
    page: currentPage,
    limit: perPage,
    search: searchTerm.trim() || undefined,
    status: selectedStatus !== "All" ? selectedStatus : undefined,
    customer: selectedCustomer !== "All" ? selectedCustomer : undefined,
  });

  const discounts: IDiscountItem[] = discountResponse?.data || [];
  const pagination = discountResponse?.meta || {
    total: discounts.length,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  // Mutations
  const [createDiscount, { isLoading: isCreating }] = useCreateDiscountMutation();
  const [updateDiscount, { isLoading: isUpdating }] = useUpdateDiscountMutation();
  const [deleteDiscount, { isLoading: isDeleting }] = useDeleteDiscountMutation();

  // Products Query for Specific Products Selection
  const [productSearch, setProductSearch] = useState("");
  const { data: productsResponse } = useAllProductsQuery({
    searchTerm: productSearch || undefined,
    limit: 100,
  });

  // Safe extraction of products array from API response
  const allProductsList: any[] = Array.isArray(productsResponse?.data)
    ? productsResponse.data
    : Array.isArray(productsResponse?.data?.products)
    ? productsResponse.data.products
    : Array.isArray(productsResponse)
    ? productsResponse
    : [];

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewingDiscount, setViewingDiscount] = useState<IDiscountItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State (Single unified Discount)
  const [formData, setFormData] = useState({
    name: "",
    discount_type: "percentage" as "percentage" | "flat",
    discount_value: 10,
    valid_from: new Date().toISOString().split("T")[0],
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    customer_group: "All",
    apply_to: "all" as "all" | "specific",
    products: [] as string[],
    status: "Active" as "Active" | "Inactive" | "Expired",
  });

  // Select all table checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(discounts.map((d) => d._id || ""));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      discount_type: "percentage",
      discount_value: 10,
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
      customer_group: "All",
      apply_to: "all",
      products: [],
      status: "Active",
    });
    setProductSearch("");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: IDiscountItem) => {
    setEditingId(item._id || null);
    setFormData({
      name: item.name,
      discount_type: item.discount_type,
      discount_value: item.discount_value,
      valid_from: item.valid_from ? new Date(item.valid_from).toISOString().split("T")[0] : "",
      valid_to: item.valid_to ? new Date(item.valid_to).toISOString().split("T")[0] : "",
      days: item.days?.length ? item.days : ["All Days"],
      customer_group: item.customer_group || "All",
      apply_to: item.apply_to || "all",
      products: item.products?.map((p: any) => (typeof p === "string" ? p : p._id)) || [],
      status: item.status || "Active",
    });
    setProductSearch("");
    setIsFormModalOpen(true);
  };

  // Submit Create / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter a discount name");
      return;
    }

    if (formData.apply_to === "specific" && formData.products.length === 0) {
      toast.error("Please select at least one product or choose 'All Products'");
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        discount_plan: "Standard",
        valid_from: new Date(formData.valid_from),
        valid_to: new Date(formData.valid_to),
        days: formData.days,
        customer_group: formData.customer_group,
        apply_to: formData.apply_to,
        products: formData.apply_to === "all" ? [] : formData.products,
        status: formData.status,
        is_active: formData.status === "Active",
      };

      if (editingId) {
        await updateDiscount({ id: editingId, body: payload }).unwrap();
        toast.success("Discount updated successfully!");
      } else {
        await createDiscount(payload).unwrap();
        toast.success("New discount created successfully!");
      }

      setIsFormModalOpen(false);
      refetch();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "Failed to save discount");
    }
  };

  // Delete Discount
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this discount?")) {
      try {
        await deleteDiscount(id).unwrap();
        toast.success("Discount deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error("Failed to delete discount");
      }
    }
  };

  // Toggle Day Selection
  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const exists = prev.days.includes(day);
      if (exists) {
        return { ...prev, days: prev.days.filter((d) => d !== day) };
      } else {
        return { ...prev, days: [...prev.days, day] };
      }
    });
  };

  // Toggle Product Selection
  const toggleProduct = (productId: string) => {
    setFormData((prev) => {
      const exists = prev.products.includes(productId);
      if (exists) {
        return { ...prev, products: prev.products.filter((id) => id !== productId) };
      } else {
        return { ...prev, products: [...prev.products, productId] };
      }
    });
  };

  // Format Date Range
  const formatDateRange = (from?: string, to?: string) => {
    if (!from || !to) return "No date set";
    const d1 = new Date(from);
    const d2 = new Date(to);
    const opt: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
    return `${d1.toLocaleDateString("en-GB", opt)} - ${d2.toLocaleDateString("en-GB", opt)}`;
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Name", "Value", "Validity", "Days", "Products", "Customer", "Status"];
    const rows = discounts.map((d) => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.discount_value} (${d.discount_type === "percentage" ? "Percentage" : "Flat"})"`,
      `"${formatDateRange(d.valid_from, d.valid_to)}"`,
      `"${d.days?.join(", ") || "All Days"}"`,
      `"${d.apply_to === "all" ? "All Products" : `Specific Products (${d.products?.length || 0})`}"`,
      `"${d.customer_group}"`,
      `"${d.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `discounts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Discounts exported to Excel / CSV!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Discount</h1>
          <p className="text-sm text-slate-500 font-normal">Manage storewide & product-specific discounts</p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            title="Download PDF"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs group"
          >
            <span className="text-red-500 font-bold text-xs flex items-center">
              <FileText className="w-5 h-5 text-red-500" />
            </span>
          </button>

          {/* Excel Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export Excel"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs group"
          >
            <span className="text-emerald-600 font-bold text-xs flex items-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedCustomer("All");
              setSelectedStatus("All");
              refetch();
              toast.info("Refreshed discounts");
            }}
            title="Refresh"
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>

          {/* Collapse/Expand Toolbar */}
          <button
            type="button"
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            title={isFilterCollapsed ? "Expand Toolbar" : "Collapse Toolbar"}
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-xs text-slate-600"
          >
            {isFilterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {/* + Add Discount Button (Orange) */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Discount</span>
          </button>
        </div>
      </div>

      {/* ─── Main White Card Container ─── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search & Filters */}
        {!isFilterCollapsed && (
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by discount name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Customer Dropdown */}
              <div className="relative">
                <select
                  value={selectedCustomer}
                  onChange={(e) => {
                    setSelectedCustomer(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="All">Customer: All</option>
                  <option value="Standard">Standard</option>
                  <option value="Membership">Membership</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-slate-200 rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-700 outline-none focus:border-orange-500 cursor-pointer font-medium"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* ─── Table ─── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white text-slate-700 font-semibold">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      discounts.length > 0 &&
                      discounts.every((d) => selectedIds.includes(d._id || ""))
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Value</th>
                <th className="py-3.5 px-4">Validity</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Products</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
                      <span>Loading discounts...</span>
                    </div>
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No discounts found. Click "+ Add Discount" to create one.
                  </td>
                </tr>
              ) : (
                discounts.map((item) => {
                  const isSelected = selectedIds.includes(item._id || "");
                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? "bg-orange-50/40" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(item._id || "", e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.name}
                      </td>

                      {/* Value: e.g. "70 (Percentage)" or "40 (Flat)" */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {item.discount_value}{" "}
                        <span className="text-slate-500 font-normal">
                          ({item.discount_type === "percentage" ? "Percentage" : "Flat"})
                        </span>
                      </td>

                      {/* Validity */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        {formatDateRange(item.valid_from, item.valid_to)}
                      </td>

                      {/* Days */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        {item.days && item.days.length > 0 ? item.days.join(", ") : "All Days"}
                      </td>

                      {/* Products (All Products vs Specific Products) */}
                      <td className="py-3.5 px-4">
                        {item.apply_to === "all" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <Globe className="w-3 h-3 text-blue-500" />
                            All Products
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setViewingDiscount(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer"
                          >
                            <Package className="w-3 h-3 text-purple-500" />
                            Specific Products ({item.products?.length || 0})
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === "Active" && (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        )}
                        {item.status === "Expired" && (
                          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Expired
                          </span>
                        )}
                        {item.status === "Inactive" && (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingDiscount(item)}
                            title="View Details"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Discount"
                            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-orange-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id)}
                            title="Delete Discount"
                            className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || discounts.length}
            perPage={perPage}
            onPageChange={(page) => setCurrentPage(page)}
            onPerPageChange={(count) => {
              setPerPage(count);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ─── Add / Edit Discount Modal ─── */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Discount" : "Add Discount"}
                </h2>
                <p className="text-xs text-slate-500">
                  Configure discount rules, product scope, and validity
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Discount Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Discount Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Deal, Flash Sale, Clearance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                />
              </div>

              {/* Type, Value, Customer */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value as "percentage" | "flat",
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Customer Group
                  </label>
                  <select
                    value={formData.customer_group}
                    onChange={(e) => setFormData({ ...formData, customer_group: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  >
                    <option value="All">All Customers</option>
                    <option value="Standard">Standard</option>
                    <option value="Membership">Membership</option>
                  </select>
                </div>
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Valid To *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.valid_to}
                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Days Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase">
                    Active Days
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        days:
                          formData.days.length === DAYS_OF_WEEK.length
                            ? []
                            : [...DAYS_OF_WEEK],
                      })
                    }
                    className="text-xs text-orange-600 hover:underline font-medium"
                  >
                    {formData.days.length === DAYS_OF_WEEK.length ? "Deselect All" : "Select All Days"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = formData.days.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-500 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ─── Product Selection (All Products vs Specific Products) ─── */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Products Scope (প্রোডাক্ট নির্ধারণ) *
                </label>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* All Products Option */}
                  <div
                    onClick={() => setFormData({ ...formData, apply_to: "all", products: [] })}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      formData.apply_to === "all"
                        ? "border-orange-500 bg-orange-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        formData.apply_to === "all"
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {formData.apply_to === "all" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">All Products</span>
                      <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                        দোকানের সকল প্রোডাক্টে সরাসরি ডিসকাউন্ট কার্যকর হবে
                      </span>
                    </div>
                  </div>

                  {/* Specific Products Option */}
                  <div
                    onClick={() => setFormData({ ...formData, apply_to: "specific" })}
                    className={`p-3 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      formData.apply_to === "specific"
                        ? "border-orange-500 bg-orange-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        formData.apply_to === "specific"
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {formData.apply_to === "specific" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">
                        Specific Products
                      </span>
                      <span className="text-xs text-slate-500 leading-tight block mt-0.5">
                        নির্দিষ্ট কিছু সিলেক্টেড প্রোডাক্টে ডিসকাউন্ট প্রযোজ্য হবে
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specific Products Picker UI */}
                {formData.apply_to === "specific" && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Select Products ({formData.products.length} selected)
                      </span>
                      {formData.products.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, products: [] })}
                          className="text-xs text-rose-600 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Product Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search product by title or SKU..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Scrollable Products List with Real Titles, Thumbnails, and Prices */}
                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 bg-white rounded-lg border border-slate-200">
                      {allProductsList.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No products found.
                        </div>
                      ) : (
                        allProductsList.map((p: any) => {
                          const isChecked = formData.products.includes(p._id);
                          const title = p.product_title || p.title || p.product_name || `Product #${p._id?.slice(-6)}`;
                          const img = p.thumbnail || p.product_images?.[0] || p.featured_image || "";
                          const price = p.product_price ?? p.pricing?.sale_price ?? p.pricing?.regular_price ?? 0;
                          const sku = p.sku || p.barcode || p._id?.slice(-6);

                          return (
                            <div
                              key={p._id}
                              onClick={() => toggleProduct(p._id)}
                              className={`p-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                                isChecked ? "bg-orange-50/60" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400 cursor-pointer shrink-0"
                                />
                                {img ? (
                                  <img
                                    src={img}
                                    alt={title}
                                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                                  />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                    <Package className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <div className="min-w-0 pr-2">
                                  <span className="text-xs font-semibold text-slate-800 block truncate">
                                    {title}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    SKU: {sku}
                                  </span>
                                </div>
                              </div>

                              <span className="text-xs font-bold text-slate-800 font-mono shrink-0 pl-2">
                                ৳{Number(price).toLocaleString()}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "Active" | "Inactive" | "Expired",
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500 font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editingId
                    ? "Update Discount"
                    : "Save Discount"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── View Discount Modal ─── */}
      {viewingDiscount && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{viewingDiscount.name}</h2>
                <p className="text-xs text-slate-500">
                  {viewingDiscount.discount_value}{" "}
                  {viewingDiscount.discount_type === "percentage" ? "% OFF" : "৳ FLAT"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingDiscount(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Discount Value:</span>
                <span className="font-bold text-slate-900">
                  {viewingDiscount.discount_value}{" "}
                  {viewingDiscount.discount_type === "percentage" ? "% OFF" : "৳ FLAT"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Validity:</span>
                <span className="font-medium text-slate-700">
                  {formatDateRange(viewingDiscount.valid_from, viewingDiscount.valid_to)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Active Days:</span>
                <span className="font-medium text-slate-700">
                  {viewingDiscount.days?.join(", ") || "All Days"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Customer Group:</span>
                <span className="font-semibold text-slate-800">
                  {viewingDiscount.customer_group || "All"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-600">
                  {viewingDiscount.status || "Active"}
                </span>
              </div>

              {/* Products Section */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-600 uppercase block mb-1.5">
                  Products Scope:
                </span>
                {viewingDiscount.apply_to === "all" ? (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-blue-800">
                    <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Applies storewide to All Products in the catalog</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs text-purple-700 font-semibold mb-2 block">
                      Applies to {viewingDiscount.products?.length || 0} specific product(s):
                    </span>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {viewingDiscount.products?.map((prod: any, idx: number) => {
                        const name =
                          typeof prod === "string"
                            ? `Product ID: ${prod}`
                            : prod.product_title || prod.product_name || `Product #${prod._id?.slice(-6)}`;
                        const sku = typeof prod === "object" ? prod.sku : "";
                        const price = typeof prod === "object" ? prod.product_price : null;
                        const thumb = typeof prod === "object" ? prod.thumbnail : null;

                        return (
                          <div
                            key={idx}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {thumb && (
                                <img
                                  src={thumb}
                                  alt={name}
                                  className="w-7 h-7 rounded object-cover border shrink-0"
                                />
                              )}
                              <div className="truncate">
                                <span className="font-medium text-slate-800 block truncate">{name}</span>
                                {sku && <span className="font-mono text-slate-400 text-[10px]">{sku}</span>}
                              </div>
                            </div>
                            {price !== null && (
                              <span className="font-mono font-semibold text-slate-700 shrink-0 pl-2">
                                ৳{price}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingDiscount(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
