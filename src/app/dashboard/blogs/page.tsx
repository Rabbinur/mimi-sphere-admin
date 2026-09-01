"use client"

import { useAdminBlogsQuery, useDeleteBlogMutation, useUpdateBlogMutation } from "@/components/Redux/RTK/blogApi";
import { ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

const BLOGS_PER_PAGE = 10;

const AdminBlogsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [tempSearchTerm, setTempSearchTerm] = useState("");

    const queryArgs = {
        page: currentPage,
        limit: BLOGS_PER_PAGE,
    };

    const {
        data,
        isLoading,
        error,
        isFetching,
        refetch
    } = useAdminBlogsQuery(queryArgs);

    const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
    const [updateBlog] = useUpdateBlogMutation();

    const blogs = data?.data || [];
    const totalBlogs = data?.pagination?.totalItems || 0;
    const totalPages = data?.pagination?.totalPages || 1;

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        setSearchTerm(tempSearchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setTempSearchTerm("");
        setCurrentPage(1);
    };

    const handleToggleStatus = async (blog: any) => {
        try {
            await updateBlog({ id: blog._id, data: { isPublished: !blog.isPublished } }).unwrap();
            toast.success(blog.isPublished ? "Blog unpublished" : "Blog published");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;
        try {
            await deleteBlog(id).unwrap();
            toast.success("Blog deleted successfully");
        } catch (err) {
            toast.error("Failed to delete blog");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-lg text-gray-600">Loading Blogs...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <header className="mb-8 border-b pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Blog Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Create, edit and manage your store's blog posts</p>
                </div>
                <Link href="/dashboard/blogs/create" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:opacity-95 transition">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Blog
                </Link>
            </header>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <form onSubmit={handleSearchSubmit} className="relative flex-grow flex gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={tempSearchTerm}
                            onChange={(e) => setTempSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        {(tempSearchTerm || searchTerm) && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blog</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {blogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-10 text-gray-500">No blogs found.</td>
                            </tr>
                        ) : (
                            blogs.map((blog: any) => (
                                <tr key={blog._id} className="hover:bg-gray-50 transition duration-150">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 relative rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {blog.thumbnail && (blog.thumbnail.startsWith("http") || blog.thumbnail.startsWith("/")) ? (
                                                    <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-[10px] text-gray-400">NO IMG</div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 line-clamp-1">{blog.title}</div>
                                                <div className="text-xs text-gray-500">/{blog.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{blog.author}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{blog.category || "General"}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(blog)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${blog.isPublished ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                                        >
                                            {blog.isPublished ? 'Published' : 'Draft'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <Link href={`/dashboard/blogs/edit/${blog._id}`} className="p-2 text-gray-400 hover:text-blue-600 transition">
                                            <Edit3 className="h-5 w-5" />
                                        </Link>
                                        <button onClick={() => handleDelete(blog._id)} disabled={isDeleting} className="p-2 text-gray-400 hover:text-red-600 transition">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 pb-10">
                    <p className="text-sm text-gray-600">Showing {blogs.length} blogs</p>
                    <nav className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">{currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default AdminBlogsPage;
