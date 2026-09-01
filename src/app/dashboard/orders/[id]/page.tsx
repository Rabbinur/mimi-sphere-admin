"use client";

import {
    useOrderStatusUpdateMutation,
    useSendToCarrybeeMutation,
    useSendToSteadfastMutation,
    useSingleOrderAdminQuery,
    useDeleteOrderMutation,
} from "@/components/Redux/RTK/orderApi";
import { toast } from "sonner";
import Loader from "@/components/custom/Loader";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { TOrderProduct } from "@/lib/orders/orders";
import { TOrderStatus } from "@/types";
import { format } from "date-fns";
import {
    AlertCircle,
    Calendar,
    ChevronLeft,
    DollarSign,
    ExternalLink,
    Loader2,
    MapPin,
    Package,
    Phone,
    Tag,
    Trash2,
    Truck,
    User
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FraudCheckerModal from "../_components/FraudCheckerModal";

/* ---------------- Constants ---------------- */

const ORDER_STATUSES: TOrderStatus[] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "canceled",
    "returned",
    "failed_delivery",
    "out_for_delivery",
];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const formatStatus = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ") : "N/A";

const statusBadge = (status: string) => {
    switch (status) {
        case "pending":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "processing":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "shipped":
            return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case "delivered":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "paid":
            return "bg-green-50 text-green-700 border-green-200";
        case "failed_delivery":
            return "bg-orange-50 text-orange-700 border-orange-200";
        case "out_for_delivery":
            return "bg-sky-50 text-sky-700 border-sky-200";
        case "returned":
            return "bg-purple-50 text-purple-700 border-purple-200";
        case "failed":
        case "canceled":
            return "bg-red-50 text-red-700 border-red-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

/* ---------------- Page ---------------- */

const OrderDetailsPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const orderId = id as string;

    const { data, isLoading, isError, refetch } = useSingleOrderAdminQuery(orderId);
    const [updateOrderStatus] = useOrderStatusUpdateMutation();
    const [sendToCourier] = useSendToSteadfastMutation();
    const [sendToCarrybee] = useSendToCarrybeeMutation();

    const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
    const [currentOrderStatus, setCurrentOrderStatus] = useState("");
    const [currentPaymentStatus, setCurrentPaymentStatus] = useState("");
    const [updating, setUpdating] = useState(false);
    const [sendingCourier, setSendingCourier] = useState(false);
    const [sendingCarrybee, setSendingCarrybee] = useState(false);
    const [fraudCheckPhone, setFraudCheckPhone] = useState<string | null>(null);

    const [deleteOrder, { isLoading: deletingOrder }] = useDeleteOrderMutation();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPolyLabelModal, setShowPolyLabelModal] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const handleDeleteOrder = async () => {
        try {
            await deleteOrder(orderId).unwrap();
            toast.success("Order deleted successfully 🎉");
            setShowDeleteConfirm(false);
            router.push("/dashboard/orders");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete order");
        }
    };

    const handleDownloadPdf = async () => {
        setGeneratingPdf(true);
        try {
            const { getAccessToken } = await import("@/utils/authCookie");
            const token = getAccessToken();
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/poly-label/${orderId}`,
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to download PDF from backend");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `shoppingcart-poly-label-${order.order_id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

            toast.success("PDF Poly Label downloaded successfully!");
        } catch (error) {
            console.error("PDF Generation error:", error);
            toast.error("Failed to download PDF from backend. Please try again.");
        } finally {
            setGeneratingPdf(false);
        }
    };

    useEffect(() => {
        if (data?.data) {
            setSelectedOrderStatus(data.data.order_status);
            setSelectedPaymentStatus(data.data.payment_status);
            setCurrentOrderStatus(data.data.order_status);
            setCurrentPaymentStatus(data.data.payment_status);
        }
    }, [data]);

    if (isLoading) return <Loader />;

    if (isError || !data?.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <div className="bg-red-50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load order</h2>
                <button
                    onClick={() => router.back()}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
                </button>
            </div>
        );
    }

    const order = data.data;

    const handleSendToCourier = async () => {
        if (!confirm("Are you sure you want to send this order to Steadfast Courier?")) return;
        setSendingCourier(true);
        try {
            await sendToCourier(orderId).unwrap();
            refetch();
            alert("Order sent to Steadfast successfully!");
        } catch (error: any) {
            alert(error?.data?.message || "Failed to send order to courier");
        } finally {
            setSendingCourier(false);
        }
    };

    const handleSendToCarrybee = async () => {
        if (!confirm("Are you sure you want to send this order to Carrybee Courier?")) return;
        setSendingCarrybee(true);
        try {
            await sendToCarrybee(orderId).unwrap();
            refetch();
            alert("Order sent to Carrybee successfully!");
        } catch (error: any) {
            alert(error?.data?.message || "Failed to send order to Carrybee");
        } finally {
            setSendingCarrybee(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (selectedOrderStatus === currentOrderStatus && selectedPaymentStatus === currentPaymentStatus) return;
        setUpdating(true);
        try {
            await updateOrderStatus({
                id: orderId,
                data: {
                    order_status: selectedOrderStatus,
                    payment_status: selectedPaymentStatus,
                },
            }).unwrap();
            refetch();
        } catch (error) {
            setSelectedOrderStatus(currentOrderStatus);
            setSelectedPaymentStatus(currentPaymentStatus);
        } finally {
            setUpdating(false);
        }
    };

    const isDirty = selectedOrderStatus !== currentOrderStatus || selectedPaymentStatus !== currentPaymentStatus;
    const subtotal = order.products.reduce((s: number, p: any) => s + p.total_price, 0);
    const shipping = order.delivery_charge || 0;
    const discount = order.discount_amount || 0;
    const total = order.total_price ?? Math.max(0, subtotal + shipping - discount);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b sticky top-0 z-10 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Order: {order.order_id}</h1>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusBadge(currentOrderStatus)}`}>
                        {formatStatus(currentOrderStatus)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${statusBadge(currentPaymentStatus)}`}>
                        {formatStatus(currentPaymentStatus)}
                    </span>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-12 gap-8">

                {/* MAIN COLUMN (LEFT) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Customer Notes */}
                    {order.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 shadow-sm">
                            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-bold text-amber-900 mb-1 uppercase tracking-wider">Customer Note</h3>
                                <p className="text-sm text-amber-800 italic leading-relaxed">"{order.notes}"</p>
                            </div>
                        </div>
                    )}

                    {/* Ordered Items List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Ordered Items</h2>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border">
                                {order.products.length} Items
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.products.map((item: TOrderProduct, i: number) => (
                                <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:bg-gray-50/30 transition-colors">
                                    <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                        <Image src={item.thumbnail || "/placeholder.svg"} alt={item.title || "Product"} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4 mb-2">
                                            <Link href={`/dashboard/products`} className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                                                {item.title}
                                            </Link>
                                            <p className="font-black text-gray-900 text-xl">৳{item.total_price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="text-sm text-gray-500 font-medium">Qty: <span className="text-gray-900 font-bold">{item.quantity}</span></span>
                                            <span className="text-sm text-gray-500 font-medium">Unit Price: <span className="text-gray-900 font-bold">৳{item.price.toFixed(2)}</span></span>
                                            {item.selected_variant_values && (
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded uppercase tracking-tighter">
                                                    {item.selected_variant_values.name}: {item.selected_variant_values.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Customer Details */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200"><h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Customer</h2></div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><User className="w-4 h-4" /></div>
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Name</p><p className="text-sm font-bold text-gray-900">{order.customer_name}</p></div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Phone className="w-4 h-4" /></div>
                                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-900">{order.phone}</p>
                                        <button onClick={() => setFraudCheckPhone(order.phone)} className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors">Check Fraud</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Shipping Address (Moved to Left) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Shipping Address</h2>
                            <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="p-5">
                            <p className="text-sm font-bold text-gray-800 mb-0.5">{order.village_or_area}</p>
                            <p className="text-sm text-gray-500 mb-2">{order.upazila}, {order.district}</p>
                            {order.delivery_zone && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase tracking-tighter">
                                    Zone: {order.delivery_zone}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Summary / Totals (Moved to Left) */}


                </div>

                {/* SIDEBAR COLUMN (RIGHT) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Status Actions */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200"><h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Actions</h2></div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Order Status</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select value={selectedOrderStatus} onChange={(e) => setSelectedOrderStatus(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Payment Status</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <select value={selectedPaymentStatus} onChange={(e) => setSelectedPaymentStatus(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                                        {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleStatusUpdate} disabled={updating || !isDirty} className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${updating || !isDirty ? "bg-gray-100 text-gray-400" : "bg-blue-600 text-white hover:bg-blue-700 shadow-md transform active:scale-95"}`}>
                                {updating ? "Updating..." : "Save Changes"}
                            </button>
                            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                                <button 
                                    onClick={() => setShowPolyLabelModal(true)} 
                                    className="w-full py-2.5 rounded-xl text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Package className="w-4 h-4" />
                                    Print Poly Label
                                </button>
                                <button 
                                    onClick={() => setShowDeleteConfirm(true)} 
                                    disabled={deletingOrder}
                                    className="w-full py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Order
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Courier Logistics */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Logistics</h2>
                            <Truck className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="p-5 space-y-4">
                            {!order.courier_details?.consignment_id ? (
                                <div className="space-y-3">
                                    <div className="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 text-[10px] text-indigo-700 font-bold uppercase">Ready to Dispatch</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button onClick={handleSendToCourier} disabled={sendingCourier || sendingCarrybee} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                            {sendingCourier ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />} Send Steadfast
                                        </button>
                                        <button onClick={handleSendToCarrybee} disabled={sendingCourier || sendingCarrybee} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                                            {sendingCarrybee ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />} Send Carrybee
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className={`p-3 rounded-xl border ${order.courier_details.courier_name === 'Carrybee' ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${order.courier_details.courier_name === 'Carrybee' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
                                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-700">{order.courier_details.courier_name || 'Steadfast'} Dispatched</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500">Tracking Code: <span className="text-gray-900 font-mono">{order.courier_details.tracking_code}</span></p>
                                    </div>
                                    <Link
                                        href={order.courier_details.courier_name === 'Carrybee' ? `https://merchant.carrybee.com/order-track/${order.courier_details.consignment_id}` : `https://portal.packzy.com/tracking?code=${order.courier_details.tracking_code}`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 w-full py-2 text-[10px] font-bold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
                                    >
                                        <ExternalLink className="w-3 h-3" /> Tracking Portal
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Summary</h2>
                            <Tag className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="p-5 space-y-3">
                            <div className="flex justify-between text-sm font-medium text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-gray-900 font-bold">৳{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium text-gray-500">
                                <span>Shipping Charge</span>
                                <span className="text-gray-900 font-bold">৳{shipping.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm font-medium text-red-500">
                                    <span>Discount {order.coupon ? `(${order.coupon})` : ""}</span>
                                    <span className="font-bold">-৳{discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-dashed pt-3 mt-3 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Total Due</span>
                                    <span className="text-xs font-bold text-gray-500 capitalize tracking-tighter">via {order.payment_method}</span>
                                </div>
                                <span className="text-3xl font-black text-blue-600 leading-none">৳{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <FraudCheckerModal phone={fraudCheckPhone || undefined} isOpen={!!fraudCheckPhone} onClose={() => setFraudCheckPhone(null)} />

            {/* Poly Label Preview Dialog */}
            <Dialog open={showPolyLabelModal} onOpenChange={setShowPolyLabelModal}>
                <DialogContent className="max-w-4xl bg-white max-h-[95vh] flex flex-col p-6 rounded-2xl text-black">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-5 h-5 text-indigo-600" />
                            Courier Poly Label Preview
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Verify details and download the A4 printable label.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Scrollable Preview Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 rounded-xl flex justify-center items-start min-h-[300px]">
                        
                        {/* Visual responsive replica (aspect-[1.414/1]) */}
                        <div className="bg-white w-full max-w-[650px] aspect-[1.414/1] shadow-lg border border-gray-200 p-4 flex flex-col justify-between select-none relative rounded-md overflow-hidden">
                            
                            {/* Watermark Logo Background */}
                            <div 
                                className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none"
                                style={{
                                    backgroundImage: `url('https://www.shoppingcart.bd/logo.png')`,
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '45%',
                                }}
                            />

                            <div className="border-[3px] border-black h-full w-full p-4 flex flex-col justify-between relative z-10">
                                
                                {/* Header */}
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex flex-col gap-1.5">
                                        <img 
                                            src="https://www.shoppingcart.bd/logo.png" 
                                            alt="Logo" 
                                            className="h-6 object-contain self-start" 
                                        />
                                    </div>
                                    <div className="flex flex-col items-end pt-1">
                                        <div className="text-[12px] font-bold">
                                            Order No: <span className="border-b border-black pb-0.5 px-2">{order.order_id}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Details */}
                                <div className="flex-1 flex flex-col justify-center gap-3 py-3">
                                    <div className="flex items-end w-full text-[13px]">
                                        <span className="font-black shrink-0 mr-3">Name:</span>
                                        <span className="flex-1 border-b border-black pb-0.5 px-1 font-bold text-gray-800">{order.customer_name}</span>
                                    </div>

                                    <div className="flex items-end w-full text-[13px]">
                                        <span className="font-black shrink-0 mr-3">Phone:</span>
                                        <span className="flex-1 border-b border-black pb-0.5 px-1 font-mono font-bold text-gray-800">{order.phone}</span>
                                    </div>

                                    <div className="flex flex-col gap-2 text-[13px]">
                                        <div className="flex items-end w-full">
                                            <span className="font-black shrink-0 mr-3">Address:</span>
                                            <span className="flex-1 border-b border-black pb-0.5 px-1 font-bold text-gray-800">
                                                {order.village_or_area}
                                            </span>
                                        </div>
                                        <div className="flex items-end w-full">
                                            <span className="flex-1 border-b border-black pb-0.5 px-1 font-bold text-gray-800">
                                                {order.upazila}, {order.district}
                                            </span>
                                        </div>
                                        <div className="w-full border-b border-black pb-0.5 h-6"></div>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex justify-between items-end w-full mt-auto">
                                    <div className="flex items-center gap-3 text-[16px]">
                                        <div className="bg-black text-white px-3 py-1 font-black uppercase tracking-wider text-[11px]">
                                            Price:
                                        </div>
                                        <div className="border-b-2 border-black pb-0.5 px-4 font-black text-lg">
                                            ৳{order.total_price.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Greeting */}
                                <div className="absolute bottom-2 left-0 right-0 text-center">
                                    <p className="font-serif italic font-bold text-[14px] tracking-wide text-black">
                                        Have a nice day!
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* Modal Footer Controls */}
                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <Button variant="outline" onClick={() => setShowPolyLabelModal(false)}>
                            Cancel
                        </Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
                            onClick={handleDownloadPdf}
                            disabled={generatingPdf}
                        >
                            {generatingPdf ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <Truck className="w-4 h-4" />
                                    Download PDF Label
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-gray-800 font-bold">Confirm Deletion</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Are you sure you want to delete this order? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteOrder}
                            disabled={deletingOrder}
                        >
                            {deletingOrder ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default OrderDetailsPage;
