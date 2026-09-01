import { HelpCircle, RotateCw, Tag, User } from "lucide-react";
import Link from "next/link";

export function TopBar() {
  return (
    <div className="w-full bg-primary text-white py-2">
      <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/contact" className="flex items-center gap-1">
            <HelpCircle size={14} />
            <span>Help Center</span>
          </Link>
          <Link href="/user-account" className="flex items-center gap-1">
            <User size={14} />
            <span>My Account</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* <span className="hidden sm:inline text-white/50">|</span> */}
          {/* <Link href="/about" className="hidden sm:flex items-center gap-1">
            <HelpCircle size={14} />
            <span>About us</span>
          </Link> */}
          <span className="hidden sm:inline text-white/50">|</span>
          <Link href="/offers" className="flex items-center gap-1">
            <Tag size={14} />
            <span>Offers</span>
          </Link>
          <span className="hidden sm:inline text-white/50">|</span>
          <Link
            href="/track-order"
            className="hidden sm:flex items-center gap-1"
          >
            <RotateCw size={14} />
            <span>Track Order</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
