import {
    Card,
    CardContent
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
export function MetricCard({ title, value, trend, icon, isWarning, chartColor }: any) {
    return (
        <Card
            className={`relative overflow-hidden border-none shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md ${isWarning ? "bg-amber-50/20" : "bg-white"}`}
        >
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div
                        className={`p-3 rounded-2xl ${isWarning ? "bg-amber-100 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}
                    >
                        {icon}
                    </div>
                    <div
                        className={`flex items-center text-xs font-bold ${trend.includes("+") ? "text-green-600" : "text-slate-400"}`}
                    >
                        {trend.includes("+") ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                        ) : null}
                        {trend}
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {title}
                    </p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{value}</h3>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute -bottom-2 -right-2 opacity-5 scale-150">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}
