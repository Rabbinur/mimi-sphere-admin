"use client";

import Loader from "@/components/custom/Loader";
import { useAddFollowUpLogMutation, useGetAllCheckoutLeadsQuery } from "@/components/Redux/RTK/checkoutLeadApi";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Activity,
    CheckCircle2,
    Clock,
    Compass,
    ExternalLink,
    Laptop,
    Mail,
    MapPin,
    Phone,
    Search,
    ShoppingCart,
    Smartphone,
    Tablet,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const statusBadge = (status: string) => {
    switch (status) {
        case "draft":
            return "bg-slate-100 text-slate-700 border-slate-200";
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "converted":
            return "bg-green-100 text-green-800 border-green-200";
        case "abandoned":
            return "bg-red-100 text-red-800 border-red-200";
        case "expired":
            return "bg-orange-100 text-orange-800 border-orange-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const getScoreColor = (score: number) => {
    if (score >= 75) return "bg-green-500 text-white";
    if (score >= 40) return "bg-yellow-500 text-slate-900";
    return "bg-red-500 text-white";
};

const getDeviceIcon = (device: string) => {
    switch (device?.toLowerCase()) {
        case "mobile":
            return <Smartphone className="w-4 h-4 text-slate-500" />;
        case "tablet":
            return <Tablet className="w-4 h-4 text-slate-500" />;
        default:
            return <Laptop className="w-4 h-4 text-slate-500" />;
    }
};

const getWhatsAppLink = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("880")
        ? cleanPhone
        : cleanPhone.startsWith("0")
            ? `88${cleanPhone}`
            : `880${cleanPhone}`;
    const message = encodeURIComponent(`Hello ${name || "Customer"},\n\nWe noticed you selected items but couldn't finish checking out. Would you like any assistance completing your order?\n\nThank you!`);
    return `https://wa.me/${formattedPhone}?text=${message}`;
};

const CheckoutRecoveryPage = () => {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    // Modals state
    const [selectedLeadForCart, setSelectedLeadForCart] = useState<any | null>(null);
    const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<any | null>(null);
    const [followUpAction, setFollowUpAction] = useState<"call" | "whatsapp" | "sms" | "email">("call");
    const [followUpRemarks, setFollowUpRemarks] = useState("");
    const [agentName, setAgentName] = useState("");

    const { data, isLoading, isError, refetch } = useGetAllCheckoutLeadsQuery({
        page,
        limit: 20,
        status,
        search
    });

    const [addFollowUpLog] = useAddFollowUpLogMutation();

    if (isLoading) return <Loader />;

    if (isError) {
        return (
            <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
                🚨 Failed to load checkout recovery leads.
                <button onClick={() => refetch()} className="ml-3 text-red-600 underline font-bold">
                    Retry
                </button>
            </div>
        );
    }

    const leads = data?.data || [];
    const meta = data?.meta || { total: 0, page: 1, limit: 20, totalPage: 1 };

    // Calculate quick stats locally for the loaded page or estimates
    const totalLeadsCount = meta.total || leads.length;
    const convertedLeads = leads.filter((l: any) => l.status === "converted").length;
    const pendingLeads = leads.filter((l: any) => l.status === "pending" || l.status === "draft").length;
    const conversionRate = totalLeadsCount > 0 ? ((convertedLeads / totalLeadsCount) * 100).toFixed(1) : "0.0";

    const handleSearch = () => {
        setPage(1);
        refetch();
    };

    const handleSaveFollowUp = async () => {
        if (!agentName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        try {
            await addFollowUpLog({
                leadId: selectedLeadForFollowUp._id,
                log: {
                    agentName,
                    action: followUpAction,
                    remarks: followUpRemarks
                }
            }).unwrap();

            toast.success("Follow-up action logged successfully! 📞");
            setSelectedLeadForFollowUp(null);
            setFollowUpRemarks("");
            setAgentName("");
            refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to log follow-up");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Checkout Recovery System (CRS)
                    </h1>
                    <p className="text-sm text-slate-500">
                        Monitor, score, and recover abandoned checkouts to maximize e-commerce conversion rates.
                    </p>
                </div>
            </div>

            {/* Metric Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 border border-slate-100 rounded-xl flex items-center shadow-sm">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-4">
                        <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Leads</p>
                        <h3 className="text-xl font-black text-slate-800">{totalLeadsCount}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 border border-slate-100 rounded-xl flex items-center shadow-sm">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mr-4">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recovered (Converted)</p>
                        <h3 className="text-xl font-black text-slate-800">{convertedLeads}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 border border-slate-100 rounded-xl flex items-center shadow-sm">
                    <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center mr-4">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Recovery</p>
                        <h3 className="text-xl font-black text-slate-800">{pendingLeads}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 border border-slate-100 rounded-xl flex items-center shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Recovery Rate</p>
                        <h3 className="text-xl font-black text-slate-800">{conversionRate}%</h3>
                    </div>
                </div>
            </div>

            {/* Filter and search controllers */}
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            placeholder="Search by customer name, phone or session..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition cursor-pointer"
                    >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft (Typing)</option>
                        <option value="pending">Pending Recovery</option>
                        <option value="converted">Converted (Ordered)</option>
                        <option value="abandoned">Abandoned (Failed)</option>
                        <option value="expired">Expired</option>
                    </select>

                    <Button onClick={handleSearch} className="font-bold">
                        Filter
                    </Button>
                </div>
            </div>

            {/* Leads Table/Grid List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                            <tr>
                                <th className="p-4">Customer Info</th>
                                <th className="p-4">Status & Score</th>
                                <th className="p-4">Cart items</th>
                                <th className="p-4">Attribution / UTM</th>
                                <th className="p-4">Activity Log</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                                        No recovery leads matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead: any) => {
                                    const totalItems = lead.cartItems?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;
                                    const lastAct = lead.lastActivityAt ? new Date(lead.lastActivityAt).toLocaleString() : "N/A";
                                    const fullAddress = [lead.villageOrArea, lead.upazila, lead.district].filter(Boolean).join(", ") || "No address entered";

                                    return (
                                        <tr key={lead._id} className="hover:bg-slate-50/50 transition duration-150">
                                            {/* Customer Info */}
                                            <td className="p-4 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">
                                                        {lead.customerName || "Anonymous Guest"}
                                                    </span>
                                                    {lead.userId && (
                                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-bold">
                                                            Registered
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                                                    {lead.phone && (
                                                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-primary transition font-mono">
                                                            <Phone className="w-3 h-3" /> {lead.phone}
                                                        </a>
                                                    )}
                                                    {lead.email && (
                                                        <span className="flex items-center gap-1 font-mono">
                                                            <Mail className="w-3 h-3" /> {lead.email}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 shrink-0" /> {fullAddress}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status and Score */}
                                            <td className="p-4 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 text-[11px] font-bold border rounded-md capitalize ${statusBadge(lead.status)}`}>
                                                        {lead.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${getScoreColor(lead.leadScore)}`}>
                                                        Score: {lead.leadScore}
                                                    </span>
                                                    {lead.orderId && (
                                                        <Link
                                                            href={`/dashboard/orders/${lead.orderId}`}
                                                            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-0.5"
                                                        >
                                                            Order <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Cart Items */}
                                            <td className="p-4 space-y-1">
                                                <div className="text-xs font-bold text-slate-700">
                                                    {totalItems} items in cart
                                                </div>
                                                <div className="text-sm font-black text-slate-800">
                                                    ৳{lead.totalPrice?.toFixed(2)}
                                                </div>
                                                <button
                                                    onClick={() => setSelectedLeadForCart(lead)}
                                                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-bold"
                                                >
                                                    Review Cart Snapshot
                                                </button>
                                            </td>

                                            {/* Attribution */}
                                            <td className="p-4 text-xs text-slate-500 space-y-1 max-w-[200px]">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                    {getDeviceIcon(lead.device)}
                                                    <span>{lead.browser || "Unknown Browser"}</span>
                                                </div>
                                                <div className="truncate text-[10px]" title={lead.referer}>
                                                    Ref: {lead.referer || "Direct"}
                                                </div>
                                                {(lead.utmSource || lead.utmMedium || lead.utmCampaign) && (
                                                    <div className="bg-slate-50 p-1 border border-slate-100 rounded text-[9px] font-mono leading-tight">
                                                        {lead.utmSource && <div className="truncate">src: {lead.utmSource}</div>}
                                                        {lead.utmCampaign && <div className="truncate">camp: {lead.utmCampaign}</div>}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Activity Log */}
                                            <td className="p-4 space-y-1 max-w-[200px]">
                                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Last: {lastAct}</span>
                                                </div>
                                                <div className="text-xs text-slate-600">
                                                    {lead.followUpHistory?.length || 0} attempts logged
                                                </div>
                                                {lead.followUpHistory?.length > 0 && (
                                                    <div className="text-[10px] bg-slate-50 p-1 border border-slate-100 rounded italic truncate text-slate-500">
                                                        "{lead.followUpHistory[lead.followUpHistory.length - 1].remarks}"
                                                    </div>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {lead.phone && (
                                                        <>
                                                            <a
                                                                href={`tel:${lead.phone}`}
                                                                className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition shadow-sm"
                                                                title="Call Lead"
                                                            >
                                                                <Phone className="w-4 h-4" />
                                                            </a>
                                                            <a
                                                                href={getWhatsAppLink(lead.phone, lead.customerName)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 bg-green-50 text-green-600 border border-green-100 rounded-lg hover:bg-green-100 transition shadow-sm"
                                                                title="WhatsApp Recovery Message"
                                                            >
                                                                <Compass className="w-4 h-4" />
                                                            </a>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setSelectedLeadForFollowUp(lead)}
                                                        className="font-bold shrink-0"
                                                    >
                                                        Log Action
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {meta.totalPage > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded disabled:opacity-50 transition"
                        >
                            Previous
                        </button>
                        <span className="text-xs font-bold text-slate-500">
                            Page {page} of {meta.totalPage}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
                            disabled={page === meta.totalPage}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded disabled:opacity-50 transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Cart snapshot view modal */}
            <Dialog open={!!selectedLeadForCart} onOpenChange={() => setSelectedLeadForCart(null)}>
                <DialogContent className="max-w-xl bg-white rounded-xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800 font-bold flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                            Cart Snapshot
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs">
                            Immutable snapshot of the cart at the moment of checkout exit.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLeadForCart && (
                        <div className="space-y-4 pt-4">
                            <div className="max-h-[300px] overflow-y-auto space-y-3">
                                {selectedLeadForCart.cartItems?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-center border-b pb-3 border-slate-100 last:border-b-0 last:pb-0">
                                        <div className="relative w-12 h-12 bg-slate-50 rounded overflow-hidden border shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.productName} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 bg-slate-100 font-black">
                                                    No Pic
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 truncate" title={item.productName}>
                                                {item.productName}
                                            </h4>
                                            <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                                                <span>Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                                                {item.sku && <span>SKU: <strong className="text-slate-800 font-mono">{item.sku}</strong></span>}
                                                {item.variant && (
                                                    <span className="bg-slate-50 px-1 border rounded text-[10px]">
                                                        {Object.entries(item.variant).map(([k, v]) => `${k}:${v}`).join(", ")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="font-black text-slate-800">
                                                ৳{item.price?.toFixed(2)}
                                            </div>
                                            {item.discount > 0 && (
                                                <div className="text-[10px] text-red-500 font-bold">
                                                    ৳{item.discount} Off
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center border-t pt-3 font-bold text-sm text-slate-800">
                                <span>Cart Total:</span>
                                <span className="text-lg font-black text-blue-600">৳{selectedLeadForCart.totalPrice?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Log follow up action modal */}
            <Dialog open={!!selectedLeadForFollowUp} onOpenChange={() => setSelectedLeadForFollowUp(null)}>
                <DialogContent className="max-w-md bg-white rounded-xl shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-800 font-bold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            Log Recovery Action
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs">
                            Record a phone call, WhatsApp text, or SMS follow-up attempt to this customer.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLeadForFollowUp && (
                        <div className="space-y-4 pt-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Agent Name</label>
                                <input
                                    type="text"
                                    value={agentName}
                                    onChange={(e) => setAgentName(e.target.value)}
                                    placeholder="Enter your name..."
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Recovery Action</label>
                                <select
                                    value={followUpAction}
                                    onChange={(e: any) => setFollowUpAction(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                                >
                                    <option value="call">Phone Call (Attempted / Contacted)</option>
                                    <option value="whatsapp">WhatsApp Recovery Message</option>
                                    <option value="sms">SMS Text Message</option>
                                    <option value="email">Email Voucher/Discount Offer</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Agent Remarks / Customer Response</label>
                                <textarea
                                    value={followUpRemarks}
                                    onChange={(e) => setFollowUpRemarks(e.target.value)}
                                    placeholder="e.g. Busy tone, offered 50tk discount coupon code, promised to order tonight..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition resize-none"
                                />
                            </div>

                            {/* Follow up history logs */}
                            {selectedLeadForFollowUp.followUpHistory?.length > 0 && (
                                <div className="space-y-2 border-t pt-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Action History Log</h4>
                                    <div className="max-h-[120px] overflow-y-auto space-y-2">
                                        {selectedLeadForFollowUp.followUpHistory.map((log: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 border p-2 rounded text-xs leading-normal">
                                                <div className="flex justify-between items-center font-bold text-slate-700 mb-0.5">
                                                    <span>{log.agentName} ({log.action})</span>
                                                    <span className="text-[10px] text-slate-400 font-normal">
                                                        {log.contactedAt ? new Date(log.contactedAt).toLocaleDateString() : ""}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 font-medium">"{log.remarks}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setSelectedLeadForFollowUp(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveFollowUp} className="bg-primary hover:bg-primary/95 text-white font-bold">
                                    Log Action
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CheckoutRecoveryPage;
