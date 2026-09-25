"use client";

import DashboardHeader from "@/components/DashboardCommonFile/DahsboardHeader";
import { dashboardRoutes, dashboardSections } from "@/components/DashboardCommonFile/DashboardRoutes";
import DashboardSidebar from "@/components/DashboardCommonFile/DashboardSidebar";
import { toggleSidebar } from "@/components/Redux/Slice/sidebarSlice";
import type { RootState } from "@/components/Redux/store";
import Link from "next/link";
import type React from "react";
import { useDispatch, useSelector } from "react-redux";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);
  const dispatch = useDispatch();

  return (
    <div className="flex bg-[#F8FAFC] w-full min-h-screen">
      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0 
          ${isSidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <Link href={"/"} className="p-4 border-b border-slate-100 mb-4">
            <div
              className={`flex items-center ${isSidebarOpen ? "px-2" : "justify-center"}`}
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <span className="text-white font-bold text-lg">SC</span>
              </div>
              {isSidebarOpen && (
                <div className="ml-3 overflow-hidden">
                  <h2 className="font-bold text-slate-900 text-base leading-tight truncate">
                    Mimi Sphere
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Admin Panel
                  </p>
                </div>
              )}
            </div>
          </Link>

          {/* Navigation Scroll Area */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pb-8">
            {dashboardSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* Section Header */}
                {isSidebarOpen ? (
                  <div
                    className={`px-3 ${
                      sIdx === 0 ? "pt-1 pb-1.5" : "pt-4 pb-1.5 border-t border-slate-100 mt-2"
                    } flex items-center justify-between`}
                  >
                    <span className="text-[13px] font-bold text-[#0f2438] tracking-tight">
                      {section.sectionTitle}
                    </span>
                  </div>
                ) : (
                  sIdx > 0 && <div className="w-8 h-[1px] bg-slate-200/80 mx-auto my-3" />
                )}

                {/* Section Links */}
                {section.routes.map((route, rIdx) => (
                  <DashboardSidebar
                    key={rIdx}
                    href={route.href}
                    icon={route.icon}
                    label={route.label}
                    children={route.children}
                    isCollapsed={isSidebarOpen}
                    index={rIdx}
                  />
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8 mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
