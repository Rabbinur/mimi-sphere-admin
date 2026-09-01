"use client";

import { useDeleteTemplateMutation, useGetTemplatesQuery } from "@/components/Redux/RTK/campaignApi";
import { Input } from "@/components/ui/input";
import { Edit3, FileText, Loader2, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const TemplatesPage = () => {
    const { data, isLoading } = useGetTemplatesQuery(undefined);
    const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();
    const [searchTerm, setSearchTerm] = useState("");

    const templates = data?.data || [];

    const filteredTemplates = templates.filter((t: any) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await deleteTemplate(id).unwrap();
            toast.success("Template deleted successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete template");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="p-2 md:p-6 container mx-auto bg-white min-h-screen">
            <header className=" my-2 md:my-4 xl:my-6 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-6 border-b">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">Email Templates</h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">Design and manage your reusable email content</p>
                </div>
                <Link
                    href="/dashboard/campaigns/templates/create"
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 font-bold text-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Template
                </Link>
            </header>

            <div className="mb-8 relative max-w-md">
                <Input
                    placeholder="Search templates by name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-2xl border-gray-200 h-12 pl-12 shadow-sm focus:ring-primary/10"
                />
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredTemplates.length === 0 ? (
                    <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <h3 className="text-lg font-black text-gray-800 tracking-tight">No templates found</h3>
                        <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">Build professional email designs once and reuse them in any campaign.</p>
                        <Link
                            href="/dashboard/campaigns/templates/create"
                            className="text-primary text-sm font-black hover:underline inline-flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Create Your First Template
                        </Link>
                    </div>
                ) : (
                    filteredTemplates.map((template: any) => (
                        <div key={template._id} className="group bg-white border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                        <FileText className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Link
                                            href={`/dashboard/campaigns/templates/edit/${template._id}`}
                                            className="p-1.5 rounded-lg border border-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                                            title="Edit"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(template._id)}
                                            disabled={isDeleting}
                                            className="p-1.5 rounded-lg border border-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                                            title="Delete"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <h2 className="text-sm font-black text-gray-900 mb-1 line-clamp-1">{template.name}</h2>
                                <p className="text-[11px] text-gray-400 mb-3 line-clamp-2 italic leading-tight">
                                    Subject: {template.subject}
                                </p>
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest">
                                    {new Date(template.updatedAt).toLocaleDateString()}
                                </span>
                                <Link
                                    href={`/dashboard/campaigns/create?templateId=${template._id}`}
                                    className="text-[10px] font-black text-primary hover:underline"
                                >
                                    Use Template →
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TemplatesPage;
