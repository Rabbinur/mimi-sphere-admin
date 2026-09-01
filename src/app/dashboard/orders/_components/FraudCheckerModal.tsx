"use client";

import { useCheckFraudMutation } from "@/components/Redux/RTK/orderApi";
import {
    AlertTriangle,
    CheckCircle2,
    Fingerprint,
    History,
    Info,
    Loader2,
    ShieldAlert,
    X
} from "lucide-react";
import React, { useEffect } from "react";

interface FraudCheckerModalProps {
    phone: string | undefined;
    isOpen: boolean;
    onClose: () => void;
}

const FraudCheckerModal: React.FC<FraudCheckerModalProps> = ({ phone, isOpen, onClose }) => {
    const [checkFraud, { data, isLoading, isError }] = useCheckFraudMutation();

    useEffect(() => {
        if (isOpen && phone) {
            checkFraud(phone);
        }
    }, [isOpen, phone, checkFraud]);

    if (!isOpen) return null;

    // Data Extraction based on your JSON structure
    const apiData = data?.data?.data;
    const rawData = apiData?.courierData;
    const reports = apiData?.reports || [];
    const summary = rawData?.summary;
    const source = data?.data?.source;

    const courierBreakdown = rawData ? Object.entries(rawData).filter(([key]) => key !== 'summary') : [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-2 sm:p-4">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-900 px-4 py-3 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-blue-400" />
                        <div>
                            <h2 className="text-white font-bold text-sm">Fraud Analysis Report</h2>
                            <p className="text-slate-400 text-[10px]">Target: {phone || "N/A"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Querying Global Databases...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-8">
                            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-800">Connection Failed</p>
                            <p className="text-xs text-slate-500 mt-1">Could not reach fraud database.</p>
                        </div>
                    ) : summary ? (
                        <div className="space-y-5">

                            {/* 1. Statistics Cards */}
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-slate-50 border p-2 rounded-lg text-center">
                                    <p className="text-[8px] font-bold text-slate-400 uppercase">Total</p>
                                    <p className="text-base font-black text-slate-900">{summary.total_parcel}</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center">
                                    <p className="text-[8px] font-bold text-emerald-600 uppercase">Success</p>
                                    <p className="text-base font-black text-emerald-900">{summary.success_parcel}</p>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-2 rounded-lg text-center">
                                    <p className="text-[8px] font-bold text-red-600 uppercase">Failed</p>
                                    <p className="text-base font-black text-red-900">{summary.cancelled_parcel}</p>
                                </div>
                                <div className={`p-2 rounded-lg border text-center ${summary.success_ratio > 70 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase">Ratio</p>
                                    <p className="text-base font-black text-slate-900">{Math.round(summary.success_ratio)}%</p>
                                </div>
                            </div>

                            {/* 2. Fraud Reports Section (The "Reports" Data) */}
                            {reports.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1">
                                        <Fingerprint className="w-3 h-3" /> User Flagged Reports
                                    </h3>
                                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-2 space-y-2">
                                        {reports.map((report: any, idx: number) => (
                                            <div key={idx} className="text-xs text-red-800 flex gap-2">
                                                <span className="shrink-0">•</span>
                                                <p>{typeof report === 'string' ? report : report.comment || "Suspicious activity detected"}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. Courier Breakdown */}
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <History className="w-3 h-3" /> Courier Specific Performance
                                </h3>
                                <div className="grid gap-2">
                                    {courierBreakdown.map(([key, courier]: [string, any]) => {
                                        if (!courier.total_parcel || courier.total_parcel === 0) return null;
                                        return (
                                            <div key={key} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-white shadow-sm">
                                                <img src={courier.logo} alt={courier.name} className="w-7 h-7 object-contain grayscale-[0.2]" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-end mb-1">
                                                        <span className="text-xs font-bold text-slate-700">{courier.name}</span>
                                                        <span className="text-[10px] font-mono text-slate-500">
                                                            {courier.success_parcel} / {courier.total_parcel} Deliv.
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${courier.success_ratio > 70 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                            style={{ width: `${courier.success_ratio}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Metadata Section */}
                            <div className="flex items-center gap-2 text-[9px] text-slate-400 font-medium pt-2 border-t border-slate-50">
                                <Info className="w-3 h-3" />
                                <span>Source: {source}</span>
                                <span className="ml-auto text-slate-300">Last Order: {summary.last_order_date || 'No recent history'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-400 text-xs">No parcel history found for this number.</div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="bg-slate-50 px-4 py-3 border-t flex items-center justify-between shrink-0">
                    <div>
                        {summary?.success_ratio > 75 ? (
                            <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                                <CheckCircle2 className="w-3 h-3" /> TRUSTED BUYER
                            </span>
                        ) : summary?.success_ratio < 50 ? (
                            <span className="text-red-600 text-[10px] font-bold flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                                <AlertTriangle className="w-3 h-3" /> HIGH RISK
                            </span>
                        ) : null}
                    </div>
                    <button onClick={onClose} className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800">
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FraudCheckerModal;