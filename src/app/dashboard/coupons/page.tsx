"use client";

import { useDeleteCouponMutation, useGetCouponsQuery } from "@/components/Redux/RTK/couponApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit3, Ticket, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CreateEditCouponDialog from "./_components/CreateEditCouponDialog";

export default function CouponManagementPage() {
    const { data: response, isLoading, isError, refetch } = useGetCouponsQuery({});
    const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();

    const coupons = response?.data || [];

    const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const openEdit = (coupon: any) => {
        setEditingCoupon(coupon);
        setEditOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await deleteCoupon(id).unwrap();
            toast.success("Coupon deleted successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete coupon");
        }
    };

    const formatDate = (date: any) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Ticket className="w-8 h-8 text-primary" />
                        Coupons
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage discount codes and promotional offers</p>
                </div>
                <CreateEditCouponDialog mode="create" triggerLabel="+ Create Coupon" onSuccess={() => refetch()} />
            </div>

            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100">
                    <CardTitle className="text-lg font-bold text-slate-800">All Discount Codes</CardTitle>
                </CardHeader>

                <CardContent className="p-0 bg-white">
                    {isLoading && <div className="p-12 text-center text-slate-400">Loading coupons...</div>}
                    {isError && <div className="p-12 text-center text-red-500">Failed to load coupons.</div>}

                    {!isLoading && !isError && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead className="font-bold">Code</TableHead>
                                        <TableHead className="font-bold">Discount</TableHead>
                                        <TableHead className="font-bold">Validity</TableHead>
                                        <TableHead className="font-bold">Usage</TableHead>
                                        <TableHead className="font-bold">Min. Order</TableHead>
                                        <TableHead className="font-bold">Status</TableHead>
                                        <TableHead className="text-right font-bold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {coupons.length > 0 ? (
                                        coupons.map((coupon: any) => (
                                            <TableRow key={coupon._id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-black text-slate-900 tracking-tight">
                                                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                                        {coupon.code}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-primary">
                                                        {coupon.discount_type === "percentage"
                                                            ? `${coupon.discount_value}%`
                                                            : `৳${coupon.discount_value}`
                                                        }
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">
                                                    {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
                                                </TableCell>
                                                <TableCell className="text-xs font-medium">
                                                    {coupon.usage_count} / {coupon.usage_limit || "∞"}
                                                </TableCell>
                                                <TableCell className="text-xs">
                                                    {coupon.minimum_order_amount ? `৳${coupon.minimum_order_amount}` : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {coupon.is_active ? (
                                                        <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-slate-200 text-slate-500">Disabled</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button size="icon" variant="ghost" onClick={() => openEdit(coupon)} className="h-8 w-8 text-slate-400 hover:text-primary">
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            disabled={deleting}
                                                            onClick={() => handleDelete(coupon._id)}
                                                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 text-slate-400">
                                                <Ticket className="w-12 h-12 mx-auto mb-3 opacity-10" />
                                                No coupons found. Create your first discount code!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <CreateEditCouponDialog
                mode="edit"
                open={editOpen}
                onOpenChange={(v) => {
                    setEditOpen(v);
                    if (!v) setEditingCoupon(null);
                }}
                couponToEdit={editingCoupon}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
