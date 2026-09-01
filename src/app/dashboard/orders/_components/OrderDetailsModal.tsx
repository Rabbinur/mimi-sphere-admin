"use client";

import { currency, formatDate, TOrder } from "@/lib/orders/orders";
// Added 'Store' to imports
import { Calendar, CreditCard, Edit, FileText, Mail, MapPin, Package, Phone, ShoppingCart, Truck, User, X } from "lucide-react";
import Link from "next/link";

type ModalProps = {
    order: TOrder | null;
    onClose: () => void;
};

const statusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";

        case "processing":
            return "bg-blue-100 text-blue-800 border-blue-200";

        case "shipped":
            return "bg-indigo-100 text-indigo-800 border-indigo-200";

        case "delivered":
            return "bg-green-100 text-green-800 border-green-200";

        case "failed_delivery":
            return "bg-orange-100 text-orange-800 border-orange-200";

        case "out_for_delivery":
            return "bg-sky-100 text-sky-800 border-sky-200";

        case "returned":
            return "bg-purple-100 text-purple-800 border-purple-200";

        case "canceled":
            return "bg-red-100 text-red-800 border-red-200";

        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};


const OrderDetailsModal = ({ order, onClose }: ModalProps) => {
    if (!order) return null;

    const subtotal = order.products.reduce(
        (sum, p) => sum + p.total_price,
        0
    );
    const totalItems = order.products.reduce(
        (sum, p) => sum + p.quantity,
        0
    );
    const totalDue = subtotal + (order.delivery_charge || 0);

    // Helper function for data display
    const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined | null }) => (
        <div className="flex items-start text-sm">
            <Icon className="w-4 h-4 text-gray-500 mr-2 mt-1 flex-shrink-0" />
            <div>
                <span className="font-semibold text-gray-700 block">{label}</span>
                <p className="text-gray-900">{value || '-'}</p>
            </div>
        </div>
    );

    // Helper for status badges
    const StatusBadge = ({ status, label }: { status: string, label: string }) => (
        <div className="text-sm">
            <span className="font-semibold text-gray-700 block mb-1">{label} Status</span>
            <span
                className={`inline-block px-3 py-1 text-xs font-bold uppercase bg-primary rounded ${statusBadge(
                    status
                )}`}
            >
                {status.replace(/_/g, ' ')}
            </span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl mx-4 bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden transition-transform duration-300 transform scale-100">

                {/* Header */}
                <div className="sticky top-0 z-10 p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-8)} (Quick View)</h2>
                        <p className="text-sm text-gray-500">
                            Placed on: {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"
                        title="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content - Scrollable area */}
                <div className="p-4 space-y-4 max-h-[calc(90vh-68px)] overflow-y-auto">

                    {/* Status & Dates Section */}
                    <div className="grid grid-cols-3 gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <StatusBadge status={order.order_status} label="Order" />
                        <StatusBadge status={order.payment_status} label="Payment" />

                        <div className="text-sm">
                            <span className="font-semibold text-gray-700 block mb-1">Last Updated</span>
                            <p className="text-gray-900 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-500" /> {formatDate(order.updatedAt)}
                            </p>
                        </div>
                    </div>

                    {/* Customer & Shipping Details */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Customer */}
                        <div className="p-3 border border-gray-200 rounded-lg space-y-2">
                            <h3 className="text-sm font-semibold border-b pb-1 mb-2 text-gray-800 flex items-center gap-1">
                                <User className="w-4 h-4 text-blue-600" /> Customer
                            </h3>
                            <DetailItem icon={User} label="Name" value={order.customer_name} />
                            <DetailItem icon={Mail} label="Email" value={order.email} />
                            <DetailItem icon={Phone} label="Phone" value={order.phone} />
                            <DetailItem icon={CreditCard} label="Method" value={order.payment_method} />
                        </div>

                        {/* Shipping Address */}
                        <div className="p-3 border border-gray-200 rounded-lg space-y-2">
                            <h3 className="text-sm font-semibold border-b pb-1 mb-2 text-gray-800 flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-blue-600" /> Shipping
                            </h3>

                            <DetailItem icon={Truck} label="Zone" value={order.delivery_zone?.replace(/_/g, ' ') || 'N/A'} />

                            {/* Address Details (Shown for both, context for customer location) */}
                            <DetailItem icon={MapPin} label="Area" value={order.village_or_area} />
                            <DetailItem icon={Package} label="Upazila" value={order.upazila} />
                            <DetailItem icon={MapPin} label="District" value={order.district} />
                        </div>
                    </div>

                    {/* Totals & Notes */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                        {/* Notes */}
                        <div className="p-3 border border-gray-200 rounded-lg">
                            <h3 className="text-sm font-semibold mb-2 text-gray-800">Customer Notes</h3>
                            <p className="text-xs text-gray-700 h-full min-h-[60px] max-h-[100px] overflow-y-auto">
                                {order.notes || "No notes."}
                            </p>
                        </div>

                        {/* Totals Summary */}
                        <div className="p-3 border border-gray-200 rounded-lg space-y-1 bg-gray-50">
                            <h3 className="text-sm font-semibold border-b pb-1 mb-2 text-gray-800">Financial Summary</h3>

                            <div className="flex justify-between text-sm text-gray-700">
                                <span className="flex items-center gap-1"><ShoppingCart className="w-4 h-4" /> Item Count:</span>
                                <span>{totalItems}</span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-700">
                                <span>Subtotal:</span>
                                <span>{currency(subtotal)}</span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-700">
                                <span>Shipping:</span>
                                <span>{currency(order.delivery_charge || 0)}</span>
                            </div>

                            <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-base text-blue-600">
                                <span>GRAND TOTAL:</span>
                                <span>{currency(totalDue)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 bg-white flex justify-end gap-2">
                    <Link
                        href={`/dashboard/orders/${order._id}`}
                        onClick={onClose}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        <FileText className="w-4 h-4" /> View Full Details
                    </Link>

                    <Link
                        href={`/dashboard/orders/${order._id}?edit=true`}
                        onClick={onClose}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Edit className="w-4 h-4" /> Edit Order
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
