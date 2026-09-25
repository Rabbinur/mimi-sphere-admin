"use client";

import { useState } from "react";
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
  useCreateReviewMutation,
} from "@/components/Redux/RTK/reviewApi";
import {
  useGetAllCustomerReviewsQuery,
  useCreateCustomerReviewMutation,
  useUpdateCustomerReviewMutation,
  useDeleteCustomerReviewMutation,
  ICustomerReview,
} from "@/components/Redux/RTK/customerReviewApi";
import { useAdminProductsQuery } from "@/components/Redux/RTK/productApi";
import { MediaFile, MediaLibrary } from "@/components/ui/media-manager";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Loader2,
  User,
  X,
  Filter,
  MessageSquare,
  ExternalLink,
  Edit,
  Sparkles,
  Quote,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ReviewsPage = () => {
  const [activeTab, setActiveTab] = useState<"customer-reviews" | "product-reviews">("customer-reviews");

  // =================== PRODUCT REVIEWS STATE ===================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    data: reviewsData,
    isLoading: isProductReviewsLoading,
  } = useGetAllReviewsQuery({
    searchTerm,
    status: statusFilter,
  });
  const [deleteReview] = useDeleteReviewMutation();
  const [updateStatus] = useUpdateReviewStatusMutation();
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [newReview, setNewReview] = useState({
    reviewer_name: "",
    reviewer_image: "",
    rating: 5,
    comment: "",
    is_verified_purchase: true,
  });

  const [productSearch, setProductSearch] = useState("");
  const { data: productsData } = useAdminProductsQuery({
    searchTerm: productSearch,
    limit: 5,
  });

  // =================== HOMEPAGE CUSTOMER REVIEWS STATE ===================
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerStatusFilter, setCustomerStatusFilter] = useState("");
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomerReview, setEditingCustomerReview] = useState<ICustomerReview | null>(null);

  const {
    data: customerReviewsData,
    isLoading: isCustomerReviewsLoading,
  } = useGetAllCustomerReviewsQuery({
    searchTerm: customerSearch,
    status: customerStatusFilter || undefined,
  });
  const [createCustomerReview, { isLoading: isCreatingCustomer }] = useCreateCustomerReviewMutation();
  const [updateCustomerReview, { isLoading: isUpdatingCustomer }] = useUpdateCustomerReviewMutation();
  const [deleteCustomerReview] = useDeleteCustomerReviewMutation();

  const [customerForm, setCustomerForm] = useState({
    name: "",
    image: "",
    rating: 5,
    review: "",
    tag: "Verified Buyer",
    is_verified: true,
    is_featured: true,
    status: "active" as "active" | "inactive",
    order: 0,
  });

  // =================== PRODUCT REVIEW HANDLERS ===================
  const handleDeleteProductReview = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(id).unwrap();
        toast.success("Review deleted successfully");
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Review ${status} successfully`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const toggleProductSelection = (product: any) => {
    const isAlreadySelected = selectedProducts.find((p) => p._id === product._id);
    if (isAlreadySelected) {
      setSelectedProducts(selectedProducts.filter((p) => p._id !== product._id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch("");
  };

  const handleCreateProductReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0) return toast.error("Please select at least one product");

    try {
      const promises = selectedProducts.map((product) =>
        createReview({
          ...newReview,
          product_id: product._id,
        }).unwrap()
      );

      await Promise.all(promises);
      toast.success(`Reviews added for ${selectedProducts.length} products`);
      setIsAddModalOpen(false);
      setSelectedProducts([]);
      setNewReview({
        reviewer_name: "",
        reviewer_image: "",
        rating: 5,
        comment: "",
        is_verified_purchase: true,
      });
    } catch (err) {
      toast.error("Failed to add some reviews");
    }
  };

  // =================== CUSTOMER REVIEW HANDLERS ===================
  const handleOpenAddCustomerModal = () => {
    setEditingCustomerReview(null);
    setCustomerForm({
      name: "",
      image: "",
      rating: 5,
      review: "",
      tag: "Verified Buyer",
      is_verified: true,
      is_featured: true,
      status: "active",
      order: 0,
    });
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomerModal = (review: ICustomerReview) => {
    setEditingCustomerReview(review);
    setCustomerForm({
      name: review.name || "",
      image: review.image || "",
      rating: review.rating || 5,
      review: review.review || "",
      tag: review.tag || "Verified Buyer",
      is_verified: review.is_verified ?? true,
      is_featured: review.is_featured ?? true,
      status: review.status || "active",
      order: review.order || 0,
    });
    setIsCustomerModalOpen(true);
  };

  const handleDeleteCustomerReview = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer review?")) {
      try {
        await deleteCustomerReview(id).unwrap();
        toast.success("Customer review deleted successfully");
      } catch (err) {
        toast.error("Failed to delete customer review");
      }
    }
  };

  const handleToggleCustomerStatus = async (review: ICustomerReview) => {
    const nextStatus = review.status === "active" ? "inactive" : "active";
    try {
      await updateCustomerReview({
        id: review._id!,
        data: { status: nextStatus },
      }).unwrap();
      toast.success(`Review is now ${nextStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleSaveCustomerReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return toast.error("Customer name is required");
    if (!customerForm.review.trim()) return toast.error("Review feedback is required");

    try {
      if (editingCustomerReview && editingCustomerReview._id) {
        await updateCustomerReview({
          id: editingCustomerReview._id,
          data: customerForm,
        }).unwrap();
        toast.success("Customer review updated successfully!");
      } else {
        await createCustomerReview(customerForm).unwrap();
        toast.success("Customer review created successfully!");
      }
      setIsCustomerModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save customer review");
    }
  };

  const productReviews = reviewsData?.data || [];
  const customerReviews = customerReviewsData?.data || [];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-[#002447]" />
            Reviews & Feedback
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage homepage customer testimonials and product reviews
          </p>
        </div>

        {activeTab === "customer-reviews" ? (
          <button
            onClick={handleOpenAddCustomerModal}
            className="inline-flex items-center px-4 py-2.5 bg-[#002447] hover:bg-[#071426] text-white rounded-xl shadow-sm transition font-semibold text-sm gap-2"
          >
            <Plus className="h-4 w-4" /> Add Homepage Review
          </button>
        ) : (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-[#002447] hover:bg-[#071426] text-white rounded-xl shadow-sm transition font-semibold text-sm gap-2"
          >
            <Plus className="h-4 w-4" /> Add Product Review
          </button>
        )}
      </header>

      {/* Modern Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("customer-reviews")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "customer-reviews"
              ? "border-[#002447] text-[#002447]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          Homepage Customer Reviews ({customerReviews.length})
        </button>
        <button
          onClick={() => setActiveTab("product-reviews")}
          className={`pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${
            activeTab === "product-reviews"
              ? "border-[#002447] text-[#002447]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Star className="h-4 w-4 text-yellow-500" />
          Product Reviews ({productReviews.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOMEPAGE CUSTOMER REVIEWS */}
      {/* ========================================================================= */}
      {activeTab === "customer-reviews" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search & Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 border border-gray-100">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, tag, or review text..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#002447]/20 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={customerStatusFilter}
                onChange={(e) => setCustomerStatusFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {isCustomerReviewsLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#002447]" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/80 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Feedback / Review
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                        Order
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">
                        Active
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customerReviews.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50/70 transition">
                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                className="h-11 w-11 rounded-full object-cover border-2 border-amber-400/50 shadow-sm"
                                alt=""
                              />
                            ) : (
                              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#002447] to-[#0b2545] text-white flex items-center justify-center font-bold text-base shadow-sm">
                                {item.name ? item.name.charAt(0).toUpperCase() : "C"}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                {item.name}
                                {item.is_verified && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                                    Verified ✓
                                  </span>
                                )}
                              </p>
                              {item.tag && (
                                <p className="text-xs text-amber-600 font-medium">{item.tag}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < item.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-gray-700 ml-1">
                              {Number(item.rating).toFixed(1)}
                            </span>
                          </div>
                        </td>

                        {/* Review Content */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-1 max-w-md">
                            <Quote className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700 line-clamp-2 italic">
                              "{item.review}"
                            </p>
                          </div>
                        </td>

                        {/* Order */}
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {item.order ?? 0}
                          </span>
                        </td>

                        {/* Active Switch */}
                        <td className="px-6 py-4 text-center">
                          <Switch
                            checked={item.status === "active"}
                            onCheckedChange={() => handleToggleCustomerStatus(item)}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCustomerModal(item)}
                              className="p-2 text-slate-600 hover:text-[#002447] hover:bg-slate-100 rounded-lg transition"
                              title="Edit Review"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomerReview(item._id!)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Review"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {customerReviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <MessageSquare className="h-10 w-10 text-gray-300" />
                            <p className="font-semibold text-gray-700">No homepage customer reviews found.</p>
                            <p className="text-xs text-gray-400">Click "Add Homepage Review" to create your first one.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCT REVIEWS (EXISTING) */}
      {/* ========================================================================= */}
      {activeTab === "product-reviews" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 border border-gray-100">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by comment or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#002447]/20 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
              >
                <option value="">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {isProductReviewsLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-[#002447]" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/80 border-b">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Reviewer
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Comment
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {productReviews.map((review: any) => (
                      <tr key={review._id} className="hover:bg-gray-50/70 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {review.user_id?.image || review.reviewer_image ? (
                              <img
                                src={review.user_id?.image || review.reviewer_image}
                                className="h-10 w-10 rounded-full object-cover border"
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {review.user_id?.name || review.reviewer_name || "Guest"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {review.createdAt
                                  ? format(new Date(review.createdAt), "MMM d, yyyy")
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://www.mimisphere.com/products/${review.product_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1 group"
                          >
                            <span className="truncate max-w-[150px]">
                              {review.product_slug}
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                            {review.comment}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                              review.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : review.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {review.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {review.status !== "approved" && (
                              <button
                                onClick={() => handleStatusUpdate(review._id, "approved")}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Approve"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                            )}
                            {review.status !== "rejected" && (
                              <button
                                onClick={() => handleStatusUpdate(review._id, "rejected")}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Reject"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteProductReview(review._id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {productReviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No reviews found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT HOMEPAGE CUSTOMER REVIEW */}
      {/* ========================================================================= */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCustomerReview ? "Edit Homepage Review" : "Add Homepage Review"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  This review will be displayed in the Customer Reviews section on the homepage
                </p>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomerReview} className="p-6 space-y-4">
              {/* Name & Tag */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
                    placeholder="e.g. Samira Hossain"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">
                    Subtitle / Location / Product
                  </label>
                  <input
                    type="text"
                    value={customerForm.tag}
                    onChange={(e) => setCustomerForm({ ...customerForm, tag: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
                    placeholder="e.g. Verified Buyer • Dhaka"
                  />
                </div>
              </div>

              {/* Customer Photo (Media Library + Direct URL) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase block">
                  Customer Photo / Avatar
                </label>
                <div className="flex items-center gap-3">
                  {customerForm.image ? (
                    <div className="relative w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden shrink-0 shadow-sm">
                      <img src={customerForm.image} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCustomerForm({ ...customerForm, image: "" })}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                      <User size={24} />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-1.5">
                    <MediaLibrary
                      onSelect={(files: MediaFile[]) => {
                        if (files.length > 0) {
                          setCustomerForm({ ...customerForm, image: files[0].url });
                        }
                      }}
                      multiple={false}
                      title="Select Customer Photo"
                    />
                    <input
                      type="text"
                      value={customerForm.image}
                      onChange={(e) => setCustomerForm({ ...customerForm, image: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-md text-xs outline-none focus:ring-2 focus:ring-[#002447]/20"
                      placeholder="Or paste image URL here..."
                    />
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase block">
                  Rating: {customerForm.rating} Stars
                </label>
                <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border w-max">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCustomerForm({ ...customerForm, rating: star })}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= customerForm.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">
                  Review / Feedback Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={customerForm.review}
                  onChange={(e) => setCustomerForm({ ...customerForm, review: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm leading-relaxed"
                  placeholder="e.g. আলহামদুলিল্লাহ! প্রোডাক্টটি অনেক ভালো লেগেছে। ফেব্রিক কোয়ালিটি মাশাআল্লাহ অনেক সুন্দর..."
                />
              </div>

              {/* Switches: Verified & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                  <span className="text-xs font-semibold text-gray-700">Verified Buyer</span>
                  <Switch
                    checked={customerForm.is_verified}
                    onCheckedChange={(val) => setCustomerForm({ ...customerForm, is_verified: val })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50">
                  <span className="text-xs font-semibold text-gray-700">Active</span>
                  <Switch
                    checked={customerForm.status === "active"}
                    onCheckedChange={(val) =>
                      setCustomerForm({
                        ...customerForm,
                        status: val ? "active" : "inactive",
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 border rounded-lg bg-slate-50/50 gap-2">
                  <span className="text-xs font-semibold text-gray-700 shrink-0">Order:</span>
                  <input
                    type="number"
                    value={customerForm.order}
                    onChange={(e) => setCustomerForm({ ...customerForm, order: Number(e.target.value) })}
                    className="w-16 px-2 py-1 border rounded text-xs text-center font-bold"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCustomer || isUpdatingCustomer}
                  className="px-6 py-2 bg-[#002447] hover:bg-[#071426] text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {(isCreatingCustomer || isUpdatingCustomer) && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingCustomerReview ? "Save Changes" : "Create Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD MANUAL PRODUCT REVIEW (EXISTING) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add Manual Product Review</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateProductReview} className="p-6 space-y-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Products</label>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedProducts.map((p) => (
                      <span
                        key={p._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002447]/10 text-[#002447] text-xs font-bold rounded-lg border border-[#002447]/20"
                      >
                        <img src={p.thumbnail} className="h-4 w-4 rounded-sm object-cover" alt="" />
                        {p.product_title}
                        <button
                          type="button"
                          onClick={() => toggleProductSelection(p)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product name, slug, or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
                  />
                  {productSearch && productsData?.data && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      {productsData.data.map((p: any) => {
                        const isSelected = selectedProducts.some((item) => item._id === p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => toggleProductSelection(p)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 ${
                              isSelected ? "bg-[#002447]/5" : ""
                            }`}
                          >
                            <img src={p.thumbnail} className="h-10 w-10 rounded object-cover shadow-sm" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{p.product_title}</p>
                              <div className="flex gap-2 text-[10px]">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                  SKU: {p.sku || "N/A"}
                                </span>
                                <span className="bg-[#002447]/5 px-1.5 py-0.5 rounded text-[#002447]">
                                  Slug: {p.url_handle}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="h-5 w-5 text-[#002447]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Reviewer Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.reviewer_name}
                    onChange={(e) => setNewReview({ ...newReview, reviewer_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Reviewer Image URL</label>
                  <input
                    type="text"
                    value={newReview.reviewer_image}
                    onChange={(e) => setNewReview({ ...newReview, reviewer_image: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#002447]/20 text-sm"
                  placeholder="Write the review content here..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={newReview.is_verified_purchase}
                  onChange={(e) => setNewReview({ ...newReview, is_verified_purchase: e.target.checked })}
                  className="h-4 w-4 text-[#002447] rounded"
                />
                <label htmlFor="verified" className="text-sm text-gray-600">Verified Purchase</label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || selectedProducts.length === 0}
                  className="px-8 py-2 bg-[#002447] hover:bg-[#071426] text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit Review ({selectedProducts.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
