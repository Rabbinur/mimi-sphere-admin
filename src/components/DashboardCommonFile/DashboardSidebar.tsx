"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  href?: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean; // isCollapsed is actually isOpen in the layout, naming is inverted there
  index: number;
  children?: {
    href: string;
    label: string;
  }[];
}

const DashboardSidebar = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  index,
  children,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-expand if a child route is active
  useEffect(() => {
    if (children?.some((child) => pathname === child.href)) {
      setIsOpen(true);
    }
  }, [pathname, children]);

  const isActive = href ? pathname === href : children?.some((child) => pathname === child.href);

  if (children && isCollapsed) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative ${isActive
              ? "bg-primary/10 text-primary"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <div className="flex items-center gap-3">
            <Icon
              className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                }`}
            />
            <span className="text-sm font-medium whitespace-nowrap">{label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={cn(
            "grid transition-all duration-200 ease-in-out",
            isOpen ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="ml-9 space-y-1 border-l border-slate-100 pl-2">
              {children.map((child, idx) => {
                const isChildActive = pathname === child.href;
                return (
                  <Link
                    key={idx}
                    href={child.href}
                    className={`block px-3 py-2 text-sm rounded-md transition-colors ${isChildActive
                        ? "text-primary font-medium bg-primary/5"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }


  // Fallback for single link or collapsed sidebar state
  const LinkContent = (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative ${isActive
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        } ${isCollapsed ? "justify-start" : "justify-center"}`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
          }`}
      />

      {isCollapsed && (
        <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
          {label}
        </span>
      )}

      {isActive && (
        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
      )}

      {!isCollapsed && (
        <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href}>{LinkContent}</Link>
  ) : (
    <div onClick={() => !isCollapsed && setIsOpen(!isOpen)}>{LinkContent}</div>
  );
};

export default DashboardSidebar;
