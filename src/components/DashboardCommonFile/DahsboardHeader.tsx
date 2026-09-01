"use client";
import { Bell, ChevronDown, Lock, Menu, Power, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logoutUser } from "../Authentication/logoutUser";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import { logOut, useCurrentUserInfo } from "../Redux/Slice/authSlice";
import { toggleSidebar } from "../Redux/Slice/sidebarSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { ChangePasswordModal } from "./ChangePasswordModal";

const DashboardHeader = () => {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector(useCurrentUserInfo);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-8" />;
  }

  const handleLogOutUser = () => {
    logoutUser(router);
    dispatch(logOut());
    toast.success("Logged out successfully");
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-8">
      {/* Left: Sidebar Toggle & Breadcrumbs/Search */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:bg-slate-100"
          onClick={() => dispatch(toggleSidebar())}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search analytics..."
            className="bg-transparent border-none outline-none text-sm w-48 text-slate-600 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-500 hover:text-primary transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="w-[1px] h-6 bg-slate-200 mx-1 hidden md:block" />

        {/* User Account */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors group">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-slate-200 transition-transform group-active:scale-95">
                <AvatarImage src="/assets/avatar.png" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name?.charAt(0) ?? "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 leading-none">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Full Access
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block group-hover:text-slate-600 transition-colors" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 mt-2 p-1 border-slate-200 shadow-xl rounded-xl overflow-hidden" align="end">
            <div className="bg-slate-50/50 p-4 mb-1 rounded-t-lg">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold text-slate-900 leading-none">
                  {user?.name}
                </p>
                <p className="text-[11px] font-medium leading-none text-slate-400 mt-1">
                  {user?.email}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-slate-100" />

            <div className="p-1">
              <DropdownMenuItem
                className="py-2.5 px-3 cursor-pointer rounded-lg text-slate-600 focus:bg-indigo-50 focus:text-indigo-700 transition-colors group"
                onClick={() => {
                  setMenuOpen(false);
                  setTimeout(() => setOpenPasswordModal(true), 50);
                }}
              >
                <Lock className="w-4 h-4 mr-3 text-slate-400 group-focus:text-indigo-500 transition-colors" />
                <span className="text-sm font-semibold">Change Password</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="py-2.5 px-3 cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors group mt-1"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogOutUser();
                }}
              >
                <Power className="w-4 h-4 mr-3 text-red-400 group-focus:text-red-500 transition-colors" />
                <span className="text-sm font-semibold">Logout Account</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>

        </DropdownMenu>
      </div>

      <ChangePasswordModal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
      />
    </header>
  );
};

export default DashboardHeader;
