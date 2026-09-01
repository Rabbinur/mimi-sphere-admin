"use client";
import {
    ChevronDown,
    HelpCircle,
    LogOut,
    Settings,
    ShieldCheck,
    ShoppingBag,
    User,
    UserCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type JSX, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Authentication/logoutUser";
import {
    logOut,
    useCurrentToken,
    useCurrentUserInfo,
} from "../Redux/Slice/authSlice";
import { useAppSelector } from "../Redux/hooks";

type TUserInfo = {
    email: string;
    name: string;
    isVerified: boolean;
    phone?: string;
    photo?: string;
    role: "USER" | "ADMIN";
};

export default function UserDropdown(): JSX.Element | null {
    const token = useAppSelector(useCurrentToken);
    const user = useAppSelector(useCurrentUserInfo) as TUserInfo | null;
    const userName = user?.name ?? "User";
    const isLoggedIn = Boolean(user);

    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();
    const dispatch = useDispatch<any>();

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    if (!mounted) return null;

    const handleSignOut = async () => {
        await logoutUser(router);
        dispatch(logOut());
        setIsOpen(false);
    };

    const getProfileLink = (): string => {
        if (!user) return "/";
        return user.role === "ADMIN" ? "/dashboard" : "/user-account";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger */}
            {isLoggedIn ? (
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 group cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    aria-label="User Account Menu"
                    onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") && setIsOpen(!isOpen)
                    }
                >
                    <div className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-all duration-200">
                        <div className="relative">
                            <Image
                                width={40}
                                height={40}
                                src={user?.photo || "/assets/avatar.png"}
                                alt="avatar"
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                            />
                            {user?.isVerified && (
                                <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5">
                                    <ShieldCheck className="w-3 h-3 text-blue-500 fill-blue-50" />
                                </div>
                            )}
                        </div>
                        <div className="hidden md:flex flex-col items-start leading-none">
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
                                {userName.split(" ")[0]}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                                {user?.role}
                            </span>
                        </div>
                        <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                    </div>
                </div>
            ) : (
                <Link
                    href="/login"
                    className="flex flex-col items-center justify-center group transition-all"
                >
                    <div className="p-1.5 rounded-full group-hover:bg-slate-100 transition-colors">
                        <UserCircle2 className="w-5 h-5 md:w-6 md:h-6 text-slate-700 stroke-[1.5]" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-primary/90 uppercase tracking-tight group-hover:text-primary transition-colors">
                        Sign In
                    </span>
                </Link>
            )}

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {isLoggedIn ? (
                        <div className="flex flex-col">
                            {/* User Info Header */}
                            <div className="px-5 py-2 bg-slate-50/50 border-b border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Account
                                </p>
                                <p className="text-sm font-bold text-slate-800 truncate">
                                    {userName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>

                            {/* Menu Links */}
                            <div className="">
                                <Link
                                    href={getProfileLink()}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-all group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">My Profile</span>
                                        <span className="text-[11px] text-slate-400 leading-none">
                                            Manage your personal info
                                        </span>
                                    </div>
                                </Link>

                                {user?.role === "USER" && (
                                    <>
                                        <Link
                                            href="/user-account/orders"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                                                <ShoppingBag className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">My Orders</span>
                                                <span className="text-[11px] text-slate-400 leading-none">
                                                    Track your purchases
                                                </span>
                                            </div>
                                        </Link>
                                        <Link
                                            href="user-account/account-settings"
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-all group"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                                                <Settings className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">Settings</span>
                                                <span className="text-[11px] text-slate-400 leading-none">
                                                    Privacy and preferences
                                                </span>
                                            </div>
                                        </Link>
                                    </>
                                )}

                                <Link
                                    href="/contact"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-primary/5 hover:text-primary transition-all group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-primary/10 transition-colors">
                                        <HelpCircle className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-semibold">Support Center</span>
                                </Link>
                            </div>

                            {/* Footer / Logout */}
                            <div className="p-2 border-t border-slate-100 bg-slate-50/30">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-all font-semibold text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 flex flex-col gap-3">
                            <div className="text-center mb-2">
                                <h3 className="font-bold text-slate-800">
                                    Welcome to Shopping Cart BD
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Sign in to manage your orders and profile
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="flex items-center justify-center w-full bg-primary text-white font-bold py-2.5 px-4 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="flex items-center justify-center w-full border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-all hover:bg-slate-50 active:scale-[0.98]"
                                onClick={() => setIsOpen(false)}
                            >
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
