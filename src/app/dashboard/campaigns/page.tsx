"use client";

import { useDeleteCampaignMutation, useGetCampaignsQuery, useSendCampaignMutation } from "@/components/Redux/RTK/campaignApi";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart3, Edit3, Eye, Loader2, Mail, MailOpen, Plus, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const CampaignsPage = () => {
    const { data, isLoading, error } = useGetCampaignsQuery(undefined);
    const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();
    const [sendCampaign, { isLoading: isSending }] = useSendCampaignMutation();
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const campaigns = data?.data || [];

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        try {
            await deleteCampaign(id).unwrap();
            toast.success("Campaign deleted successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete campaign");
        }
    };

    const handleSend = async (id: string) => {
        if (!window.confirm("Are you sure you want to send this campaign to all recipients?")) return;
        try {
            await sendCampaign(id).unwrap();
            toast.success("Campaign sending initiated!");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to send campaign");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-3 text-lg text-gray-600">Loading Campaigns...</p>
            </div>
        );
    }

    return (
        <div className="p-1 md:p-8 bg-white min-h-screen">
            <header className=" mb-3 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Email Marketing</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and send email campaigns to your audience</p>
                </div>
                <Link
                    href="/dashboard/campaigns/create"
                    className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95 font-semibold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Campaign
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                {campaigns.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
                        <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-800">No campaigns found</h3>
                        <p className="text-gray-500 mb-6">Create your first campaign to start reaching your customers.</p>
                        <Link
                            href="/dashboard/campaigns/create"
                            className="text-primary font-bold hover:underline"
                        >
                            Create Campaign Now
                        </Link>
                    </div>
                ) : (
                    campaigns.map((campaign: any) => (
                        <div key={campaign._id} className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${campaign.status === 'sent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        campaign.status === 'sending' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            campaign.status === 'failed' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                'bg-gray-50 text-gray-600 border border-gray-100'
                                        }`}>
                                        {campaign.status}
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {Array.isArray(campaign.target) ? campaign.target.map((t: string) => (
                                            <span key={t} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 capitalize">
                                                {t.replace(/_/g, ' ')}
                                            </span>
                                        )) : (
                                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 capitalize">
                                                {String(campaign.target || 'No Target').replace(/_/g, ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-1">{campaign.title}</h2>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-1 italic">Subject: {campaign.subject}</p>

                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        <span>{campaign.recipientsCount} recipients</span>
                                    </div>
                                    {campaign.sentAt && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                            <span>Sent on {new Date(campaign.sentAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex md:flex-col items-center gap-3 shrink-0">
                                {campaign.status === 'draft' && (
                                    <>
                                        <button
                                            onClick={() => handleSend(campaign._id)}
                                            disabled={isSending}
                                            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 font-bold text-sm shadow-sm"
                                        >
                                            {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                            Send Now
                                        </button>
                                        <Link
                                            href={`/dashboard/campaigns/edit/${campaign._id}`}
                                            className="p-2.5 rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 className="w-5 h-5" />
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(campaign._id)}
                                    disabled={isDeleting}
                                    className="p-2.5 rounded-xl border border-red-50 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    title="Delete"
                                >
                                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                </button>
                                {campaign.status === 'sent' && (
                                    <button
                                        onClick={() => {
                                            setSelectedCampaign(campaign);
                                            setIsReportOpen(true);
                                        }}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold text-sm shadow-sm"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Report
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Campaign Report Modal */}
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-w-xl bg-white rounded-xl p-3 md:p-4 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-gray-900 tracking-tight italic flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-primary" />
                            Campaign Analytics Report
                        </DialogTitle>
                        <DialogDescription className="text-xs text-gray-500 font-medium pt-1">
                            Tracking details for: <span className="text-primary font-bold">{selectedCampaign?.title}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCampaign && (
                        <div className="space-y-5 mt-4">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-primary">
                                        {selectedCampaign.sentTo?.length || 0}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Total Recipients</span>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                                    <span className="text-2xl font-black text-emerald-600">
                                        {Math.round(((selectedCampaign.sentTo?.filter((r: any) => r.status === 'opened').length || 0) / (selectedCampaign.sentTo?.length || 1)) * 100)}%
                                    </span>
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">Open Rate</span>
                                </div>
                            </div>

                            {/* Recipient List */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-gray-700 uppercase tracking-wider pl-1">Detailed Recipient Log</h4>
                                <div className="max-h-[250px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                                    {selectedCampaign.sentTo?.map((recipient: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-50 rounded-lg hover:border-primary/20 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${recipient.status === 'opened' ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-50 text-gray-400'}`}>
                                                    {recipient.status === 'opened' ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{recipient.email}</p>
                                                    <p className="text-[9px] text-gray-400">
                                                        {recipient.status === 'opened'
                                                            ? `Opened at: ${new Date(recipient.openedAt).toLocaleString()}`
                                                            : 'Delivered, not yet opened'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={recipient.status === 'opened' ? 'default' : 'secondary'} className={`rounded-full px-2 py-0.5 font-bold text-[9px] ${recipient.status === 'opened' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {recipient.status === 'opened' ? 'OPENED' : 'SENT'}
                                            </Badge>
                                        </div>
                                    ))}
                                    {(!selectedCampaign.sentTo || selectedCampaign.sentTo.length === 0) && (
                                        <div className="text-center py-6">
                                            <p className="text-xs text-gray-400 italic">No detailed tracking data available.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CampaignsPage;
