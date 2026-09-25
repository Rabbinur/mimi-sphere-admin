"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  CreditCard,
  DollarSign
} from "lucide-react";
import Pagination from "@/components/Common/Pagination";
import { toast } from "sonner";
import {
  useAllSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useAddSupplierPaymentMutation
} from "@/components/Redux/RTK/supplierApi";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data: suppliersData, isLoading, refetch } = useAllSuppliersQuery(searchTerm);
  const [createSupplier] = useCreateSupplierMutation();
  const [updateSupplier] = useUpdateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [addPayment] = useAddSupplierPaymentMutation();

  const suppliers = suppliersData?.data || [];

  // Modals
  const [mounted, setMounted] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Forms
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "Cash",
    reference: "",
    note: ""
  });

  const handleOpenEdit = (item: any) => {
    setEditingId(item._id);
    setPhoneError("");
    setFormData({
      name: item.name || "",
      contactPerson: item.contactPerson || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || ""
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id).unwrap();
        toast.success("Supplier deleted successfully");
        refetch();
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to delete supplier");
      }
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      toast.error("Name and Phone are required");
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, "");
    const bdPhoneRegex = /^(?:\+?8801|01)[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      setPhoneError("সঠিক ১১ ডিজিটের ফোন নম্বর দিন (যেমন: 017XXXXXXXX)");
      toast.error("সঠিক ১১ ডিজিটের ফোন নম্বর দিন (যেমন: 017XXXXXXXX)");
      return;
    }
    setPhoneError("");

    try {
      if (editingId) {
        await updateSupplier({ id: editingId, data: formData }).unwrap();
        toast.success("Supplier updated successfully!");
      } else {
        await createSupplier(formData).unwrap();
        toast.success("Supplier created successfully!");
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Action failed");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentForm.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    try {
      await addPayment({ id: viewingSupplier._id, data: paymentForm }).unwrap();
      toast.success("Payment recorded successfully!");
      setIsPaymentModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record payment");
    }
  };

  const totalItems = suppliers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const paginatedSuppliers = suppliers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Suppliers</h1>
          <p className="text-sm text-slate-500 font-normal">Manage your suppliers and due payments</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="w-10 h-10 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setPhoneError("");
              setFormData({ name: "", contactPerson: "", phone: "", email: "", address: "" });
              setIsAddModalOpen(true);
            }}
            className="bg-[#f97316] hover:bg-[#ea580c] active:scale-95 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Total Purchase</th>
                <th className="py-3.5 px-4 text-emerald-600">Paid</th>
                <th className="py-3.5 px-4 text-rose-600">Due</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-500">Loading...</td></tr>
              ) : paginatedSuppliers.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No suppliers found.</td></tr>
              ) : (
                paginatedSuppliers.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" /> {item.name}
                    </td>
                    <td className="py-3.5 px-4">{item.contactPerson || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.phone}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">৳{item.totalPurchase.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">৳{item.totalPaid.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">৳{item.totalDue.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingSupplier(item);
                            setIsPaymentModalOpen(true);
                          }}
                          title="Pay Due / History"
                          className="p-1.5 hover:bg-emerald-50 rounded text-slate-500 hover:text-emerald-600 transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-orange-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                          className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={(count) => { setPerPage(count); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isAddModalOpen && mounted &&
        createPortal(
          <div 
            className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAddModalOpen(false);
            }}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Supplier" : "Add Supplier"}
                </h2>
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Company / Supplier Name *</label>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contact Person</label>
                    <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone *</label>
                    <input 
                      required 
                      type="tel" 
                      placeholder="017XXXXXXXX"
                      value={formData.phone} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, phone: val });
                        const clean = val.trim().replace(/[\s-]/g, "");
                        if (!clean) {
                          setPhoneError("Phone number is required");
                        } else if (!/^(?:\+?8801|01)[3-9]\d{8}$/.test(clean)) {
                          setPhoneError("১১ ডিজিটের সঠিক নম্বর দিন (যেমন: 017XXXXXXXX)");
                        } else {
                          setPhoneError("");
                        }
                      }} 
                      className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${
                        phoneError ? "border-red-500 focus:border-red-500 bg-red-50/20" : "border-slate-200 focus:border-orange-500"
                      }`} 
                    />
                    {phoneError && (
                      <p className="text-red-500 text-[11px] font-medium mt-1 animate-in fade-in">
                        {phoneError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-orange-500" />
                  </div>
                </div>
                <div className="pt-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer">Save</button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Payment & History Modal */}
      {isPaymentModalOpen && viewingSupplier && mounted &&
        createPortal(
          <div 
            className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPaymentModalOpen(false);
            }}
          >
            <div 
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" /> Payment: {viewingSupplier.name}
                </h2>
                <button 
                  type="button" 
                  onClick={() => setIsPaymentModalOpen(false)} 
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto">
                {/* Due Summary */}
                <div className="flex justify-between items-center bg-rose-50 border border-rose-100 p-4 rounded-xl mb-6">
                  <div>
                    <p className="text-xs text-rose-600 font-bold uppercase">Current Due</p>
                    <p className="text-2xl font-black text-rose-700">৳{viewingSupplier.totalDue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-semibold">Total Paid: ৳{viewingSupplier.totalPaid.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 font-semibold">Total Purchase: ৳{viewingSupplier.totalPurchase.toLocaleString()}</p>
                  </div>
                </div>

                {/* Add Payment Form */}
                <form onSubmit={handlePaymentSubmit} className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 space-y-4">
                  <h3 className="font-bold text-slate-700 mb-2">Record New Payment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Amount (৳) *</label>
                      <input type="number" required min="1" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Method</label>
                      <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500">
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="bKash/Nagad">bKash/Nagad</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Note / Reference</label>
                    <input type="text" placeholder="Transaction ID or Note" value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs cursor-pointer">Submit Payment</button>
                  </div>
                </form>

                {/* Payment History */}
                <div>
                  <h3 className="font-bold text-slate-800 mb-3">Payment History</h3>
                  {viewingSupplier.paymentHistory && viewingSupplier.paymentHistory.length > 0 ? (
                    <div className="space-y-2">
                      {[...viewingSupplier.paymentHistory].reverse().map((pay: any, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg text-sm">
                          <div>
                            <p className="font-bold text-slate-700">৳{pay.amount.toLocaleString()} <span className="text-xs text-slate-400 font-normal">via {pay.method}</span></p>
                            {pay.note && <p className="text-xs text-slate-500">{pay.note}</p>}
                          </div>
                          <p className="text-xs font-medium text-slate-500">{new Date(pay.date).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No payments recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
