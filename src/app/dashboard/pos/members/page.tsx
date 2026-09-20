"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  useGetMembersListQuery,
  useGetCustomerHistoryQuery,
  useGetMembershipSettingsQuery,
  useUpdateMembershipSettingsMutation,
} from "@/components/Redux/RTK/posApi";
import {
  ArrowLeft,
  Crown,
  User,
  Phone,
  Search,
  Settings2,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  X,
  Save,
  Package,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Tier Badge ─────────────────────────────────────────────────── */
function TierBadge({ tier }: { tier: string }) {
  if (tier === "Gold")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
        <Crown className="w-2.5 h-2.5" /> Gold
      </span>
    );
  if (tier === "Silver")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700 border border-slate-300">
        <Crown className="w-2.5 h-2.5" /> Silver
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
      <User className="w-2.5 h-2.5" /> Regular
    </span>
  );
}

/* ─── Customer History Drawer ────────────────────────────────────── */
function CustomerHistoryDrawer({ phone, onClose }: { phone: string | null; onClose: () => void }) {
  const { data, isFetching } = useGetCustomerHistoryQuery(phone!, { skip: !phone });
  const customer = data?.data?.customer;
  const orders: any[] = data?.data?.orders || [];

  if (!phone) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-sm font-black text-slate-900">Customer History</h2>
            <p className="text-[11px] text-slate-500 font-mono">{phone}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {isFetching ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        ) : customer ? (
          <div className="flex-1 p-5 space-y-5">
            {/* Summary card */}
            <div className={`p-4 rounded-2xl border ${
              customer.membership_tier === "Gold" ? "bg-amber-50 border-amber-200"
              : customer.membership_tier === "Silver" ? "bg-slate-100 border-slate-300"
              : "bg-blue-50 border-blue-200"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-slate-900 text-sm">{customer.name}</span>
                <TierBadge tier={customer.membership_tier} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-black text-slate-950 font-mono">৳{customer.total_spent.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Total Spent</p>
                </div>
                <div className="border-x border-slate-200">
                  <p className="text-lg font-black text-slate-950">{customer.total_orders}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-600">{customer.discount_percent}%</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Discount</p>
                </div>
              </div>
            </div>

            {/* Orders */}
            <div>
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                Purchase History ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No orders found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orders.map((order: any, i: number) => (
                    <div key={order._id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          #{order.order_code || String(order._id).slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(order.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black font-mono text-slate-950">
                          ৳{(order.total_amount || order.grand_total || 0).toLocaleString()}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {(order.items || order.order_items || []).length} items
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">Customer not found</div>
        )}
      </div>
    </div>
  );
}

/* ─── Membership Settings Modal ──────────────────────────────────── */
function MembershipSettingsModal({ onClose }: { onClose: () => void }) {
  const { data: settingsData } = useGetMembershipSettingsQuery();
  const [update, { isLoading }] = useUpdateMembershipSettingsMutation();
  const [form, setForm] = useState({ silver_threshold: 1000, silver_discount: 5, gold_threshold: 3500, gold_discount: 7 });

  React.useEffect(() => {
    if (settingsData?.data) setForm(settingsData.data);
  }, [settingsData]);

  const handleSave = async () => {
    try {
      await update(form).unwrap();
      toast.success("Settings saved! All customer tiers recalculated.");
      onClose();
    } catch { toast.error("Failed to save settings"); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Membership Rules</h2>
              <p className="text-[10px] text-slate-500">Changes recalculate all existing members</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        <div className="space-y-4">
          {/* Silver tier */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <p className="text-xs font-black text-slate-700 flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-slate-500" /> 🥈 Silver Membership</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "silver_threshold", label: "Min. Total Spent (৳)" },
                { key: "silver_discount",  label: "Discount (%)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
                  <input
                    type="number" min={0} max={key.includes("discount") ? 100 : undefined}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Gold tier */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
            <p className="text-xs font-black text-amber-800 flex items-center gap-1.5"><Crown className="w-3.5 h-3.5 text-amber-600" /> 🥇 Gold Membership</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "gold_threshold", label: "Min. Total Spent (৳)" },
                { key: "gold_discount",  label: "Discount (%)" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block mb-1">{label}</label>
                  <input
                    type="number" min={0} max={key.includes("discount") ? 100 : undefined}
                    value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-mono font-bold text-slate-900 outline-none focus:border-amber-500 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10.5px] text-blue-700 font-medium">
            ⚡ Saving will instantly recalculate membership tiers for all existing customers based on their lifetime spending.
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="flex-1 py-2.5 bg-slate-900 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save & Recalculate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function PosMembersPage() {
  const [search, setSearch]             = useState("");
  const [tier, setTier]                 = useState("All");
  const [page, setPage]                 = useState(1);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { data, isFetching, refetch } = useGetMembersListQuery({
    search: search || undefined,
    tier: tier !== "All" ? tier : undefined,
    page,
    per_page: 20,
  });

  const members: any[]  = data?.data?.customers   || [];
  const total: number   = data?.data?.total       || 0;
  const totalPages: number = data?.data?.total_pages || 1;

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/pos" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-sm font-black text-slate-900">POS Members</h1>
            <p className="text-[10px] text-slate-500">{total} customers registered</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer" title="Refresh">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-violet-700 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Membership Rules</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Search + tier filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["All", "Gold", "Silver", "Regular"].map((t) => (
              <button
                key={t}
                onClick={() => { setTier(t); setPage(1); }}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tier === t ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t === "Gold" ? "🥇 " : t === "Silver" ? "🥈 " : t === "Regular" ? "👤 " : ""}
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Members table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="col-span-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">Customer</div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Tier</div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Spent</div>
            <div className="col-span-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Orders</div>
            <div className="col-span-1 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">Disc.</div>
            <div className="col-span-1" />
          </div>

          {isFetching ? (
            <div className="py-16 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <User className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-600">No members found</p>
              <p className="text-xs mt-1 text-center max-w-xs">Members are created automatically when a phone number is looked up at the POS counter</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((m: any) => (
                <div
                  key={m._id}
                  onClick={() => setSelectedPhone(m.phone)}
                  className="grid grid-cols-12 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="col-span-4 flex flex-col justify-center min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">{m.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5" /> {m.phone}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center"><TierBadge tier={m.membership_tier} /></div>
                  <div className="col-span-2 flex items-center justify-end">
                    <span className="text-xs font-black font-mono text-slate-900">৳{m.total_spent.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="flex items-center gap-1 text-xs text-slate-600 font-bold">
                      <ShoppingBag className="w-3 h-3" /> {m.total_orders}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <span className={`text-xs font-black ${m.discount_percent > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                      {m.discount_percent > 0 ? `${m.discount_percent}%` : "—"}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {totalPages} · {total} total</span>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedPhone && <CustomerHistoryDrawer phone={selectedPhone} onClose={() => setSelectedPhone(null)} />}
      {showSettings && <MembershipSettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

