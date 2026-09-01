"use client";

import { useState } from "react";
import {
  useGetAllReviewsQuery,
  useDeleteReviewMutation,
  useUpdateReviewStatusMutation,
  useCreateReviewMutation,
} from "@/components/Redux/RTK/reviewApi";
import { useAdminProductsQuery } from "@/components/Redux/RTK/productApi";
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
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Queries
  const {
    data: reviewsData,
    isLoading,
    refetch,
  } = useGetAllReviewsQuery({
    searchTerm,
    status: statusFilter,
  });
  const [deleteReview] = useDeleteReviewMutation();
  const [updateStatus] = useUpdateReviewStatusMutation();
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

  // Form State for manual review
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

  const handleDelete = async (id: string) => {
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
    const isAlreadySelected = selectedProducts.find(
      (p) => p._id === product._id,
    );
    if (isAlreadySelected) {
      setSelectedProducts(
        selectedProducts.filter((p) => p._id !== product._id),
      );
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
    setProductSearch(""); // Clear search after selection
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProducts.length === 0)
      return toast.error("Please select at least one product");

    try {
      // Create a review for each selected product
      const promises = selectedProducts.map((product) =>
        createReview({
          ...newReview,
          product_id: product._id,
        }).unwrap(),
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const reviews = reviewsData?.data || [];

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Customer Reviews
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage product feedback and manual reviews
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:opacity-90 transition"
        >
          <Plus className="h-5 w-5 mr-2" /> Add Manual Review
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by comment or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
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
              {reviews.map((review: any) => (
                <tr key={review._id} className="hover:bg-gray-50 transition">
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
                          {review.user_id?.name ||
                            review.reviewer_name ||
                            "Guest"}
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
                      href={`https://www.shoppingcart.bd/products/${review.product_slug}`}
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
                          onClick={() =>
                            handleStatusUpdate(review._id, "approved")
                          }
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      {review.status !== "rejected" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(review._id, "rejected")
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No reviews found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Manual Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Add Manual Review
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleCreateReview} className="p-6 space-y-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Select Products
                </label>

                {/* Selected Products Tags */}
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedProducts.map((p) => (
                      <span
                        key={p._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg border border-primary/20"
                      >
                        <img
                          src={p.thumbnail}
                          className="h-4 w-4 rounded-sm object-cover"
                          alt=""
                        />
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
                    placeholder="Search name, slug, or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {productSearch && productsData?.data && (
                    <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-lg shadow-xl max-h-64 overflow-y-auto">
                      {productsData.data.map((p: any) => {
                        const isSelected = selectedProducts.some(
                          (item) => item._id === p._id,
                        );
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => toggleProductSelection(p)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <img
                              src={p.thumbnail}
                              className="h-10 w-10 rounded object-cover shadow-sm"
                              alt=""
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {p.product_title}
                              </p>
                              <div className="flex gap-2 text-[10px]">
                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                  SKU: {p.sku || "N/A"}
                                </span>
                                <span className="bg-primary/5 px-1.5 py-0.5 rounded text-primary/70">
                                  Slug: {p.url_handle}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.reviewer_name}
                    onChange={(e) =>
                      setNewReview({
                        ...newReview,
                        reviewer_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Reviewer Image URL
                  </label>
                  <input
                    type="text"
                    value={newReview.reviewer_image}
                    onChange={(e) =>
                      setNewReview({
                        ...newReview,
                        reviewer_image: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= newReview.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Comment
                </label>
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Write the review content here..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={newReview.is_verified_purchase}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      is_verified_purchase: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-primary rounded"
                />
                <label htmlFor="verified" className="text-sm text-gray-600">
                  Verified Purchase
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || selectedProducts.length === 0}
                  className="px-8 py-2 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
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
