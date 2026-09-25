"use client";

import { useState, useEffect } from "react";
import {
    useGetInventoryQuery,
    useUpdateInventoryQuantityMutation,
    useBulkUpdateInventoryQuantityMutation,
    useImportInventoryCsvMutation,
} from "@/components/Redux/RTK/productApi";
import { Variant } from "./types";

export function useInventoryTable() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [statusFilter, setStatusFilter] = useState<"all" | "low_stock" | "out_of_stock" | "in_stock">("all");

    // Selection state
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [updatingIds, setUpdatingIds] = useState<number[]>([]);

    // Toast Notification State
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [perPage, setPerPage] = useState(10);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => {
            setSearchQuery(searchInput);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    // RTK Query
    const { data: res, isLoading: loading, refetch } = useGetInventoryQuery({
        page: currentPage,
        search: searchQuery.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        status_filter: statusFilter === "all" ? undefined : statusFilter,
        per_page: perPage,
    });

    const [updateQuantityMutation] = useUpdateInventoryQuantityMutation();
    const [bulkUpdateQuantityMutation] = useBulkUpdateInventoryQuantityMutation();
    const [importInventoryCsvMutation] = useImportInventoryCsvMutation();

    const responsePayload = res?.data?.counts !== undefined ? res.data : res;
    const pData = (responsePayload?.isError === false || responsePayload?.status === "success" || responsePayload?.Message === "Success" || responsePayload?.data)
        ? (responsePayload?.data || responsePayload)
        : null;

    const variants: Variant[] = Array.isArray(pData?.data) ? pData.data : (Array.isArray(pData) ? pData : []);
    const lastPage = pData?.last_page || 1;
    const rawCounts = responsePayload?.counts || res?.counts || res?.data?.counts;
    const counts = {
        total: rawCounts?.total ?? pData?.total ?? variants.length,
        low_stock: rawCounts?.low_stock ?? variants.filter(v => v.available_quantity <= 5 && v.available_quantity > 0).length,
        out_of_stock: rawCounts?.out_of_stock ?? variants.filter(v => v.available_quantity === 0).length,
        in_stock: rawCounts?.in_stock ?? variants.filter(v => v.available_quantity > 5).length,
    };
    const totalItems = counts.total;
    const from = pData?.from || 0;
    const to = pData?.to || 0;

    const handleSortChange = (newSortBy: string, newOrder: "asc" | "desc") => {
        setSortBy(newSortBy);
        setSortOrder(newOrder);
        setCurrentPage(1);
    };

    const toggleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
        setCurrentPage(1);
    };

    const updateStock = async (id: number, quantity: number) => {
        setUpdatingIds(prev => [...prev, id]);
        try {
            await updateQuantityMutation({ id, quantity }).unwrap();
            setToast({ message: "Stock updated successfully", type: "success" });
            refetch();
        } catch (err) {
            console.error("Stock update error:", err);
            setToast({ message: "Failed to update stock", type: "error" });
        } finally {
            setUpdatingIds(prev => prev.filter(vid => vid !== id));
            setTimeout(() => setToast(null), 3000);
        }
    };

    const bulkUpdateStock = async (action: "set" | "add" | "subtract", quantity: number) => {
        if (selectedIds.length === 0) return;
        try {
            await bulkUpdateQuantityMutation({ variant_ids: selectedIds, action, quantity }).unwrap();
            setToast({ message: `Updated stock for ${selectedIds.length} variants!`, type: "success" });
            setSelectedIds([]);
            refetch();
        } catch (err) {
            console.error("Bulk stock update error:", err);
            setToast({ message: "Failed to perform bulk stock update", type: "error" });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleExportCsv = () => {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        window.open(`${baseUrl}/admin/products/inventory/export${token ? `?token=${token}` : ""}`, "_blank");
    };

    const handleImportCsv = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await importInventoryCsvMutation(formData).unwrap();
            setToast({ message: res?.Message || "CSV imported successfully!", type: "success" });
            refetch();
        } catch (err: any) {
            console.error("CSV import error:", err);
            setToast({ message: err?.data?.Message || "Failed to import CSV", type: "error" });
        } finally {
            setTimeout(() => setToast(null), 3000);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === variants.length && variants.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(variants.map(v => v.id));
        }
    };

    const toggleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    return {
        // State
        currentPage,
        setCurrentPage,
        searchInput,
        setSearchInput,
        sortBy,
        sortOrder,
        statusFilter,
        setStatusFilter,
        selectedIds,
        updatingIds,
        toast,
        loading,

        // Data
        variants,
        lastPage,
        totalItems,
        counts,
        from,
        to,

        // Handlers
        handleSortChange,
        toggleSort,
        updateStock,
        bulkUpdateStock,
        handleExportCsv,
        handleImportCsv,
        toggleSelectAll,
        toggleSelectOne,
        perPage,
        setPerPage,
        handlePerPageChange: (newPerPage: number) => {
            setPerPage(newPerPage);
            setCurrentPage(1);
        },
        refetch,
    };
}
