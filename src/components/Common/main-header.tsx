"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Project Specific Imports
import { useAppSelector } from "../Redux/hooks";
import { AccountActions } from "./AccountActions";
import { MobileMenu } from "./MobileMenu";
import { MobileSearch } from "./MobileSearch";
import { SearchBar } from "./SearchBar";

// --- Desktop Nav Links ---
const NavLinks = () => {
  const pathname = usePathname();

  const links = [
    { href: "/shop", label: "Shop", isNew: false },
    { href: "/categories", label: "Categories", isNew: false },
    { href: "/contact", label: "Contact", isNew: false },
    { href: "/shop/pre-order", label: "Pre Order", isNew: true },

  ];

  return (
    <div className="hidden lg:flex items-center space-x-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-semibold transition-colors hover:text-primary flex items-center gap-1 ${pathname === link.href
            ? "text-primary border-b-2 border-primary"
            : "text-slate-600"
            }`}
        >
          {link.label}
          {link.isNew && (
            <span className="bg-orange-700 text-white px-1.5 py-0.5 text-[9px] font-bold rounded-sm uppercase leading-none">
              New
            </span>
          )}
        </Link>
      ))}
    </div>
  );
};

// --- Main Header Component ---
export const MainHeader = ({ children }: { children?: React.ReactNode }) => {
  const cartItems = useAppSelector((state) => state.cart.cartItems);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-t border-primary/10 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-2 sm:px-4 md:py-2 py-1">
        <div className="flex items-center justify-between min-h-[50px] md:min-h-[54px] gap-2 md:gap-4">

          {/* Left: Hamburger (Mobile) / Logo+Links (Desktop) */}
          <div className="flex items-center flex-1 md:flex-none gap-2 lg:gap-8">
            <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

            {/* Desktop Logo */}
            <Link href="/" className="hidden md:block shrink-0">
              <Image
                src={"/logo.png"}
                alt="Logo"
                width={180}
                height={70}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                priority
                fetchPriority="high"
              />
            </Link>

            <div className="hidden lg:block">
              <NavLinks />
            </div>
          </div>

          {/* Center: Mobile Logo */}
          <div className="flex md:hidden flex-1 justify-center">
            <Link href="/" className="shrink-0">
              <Image
                src={"/logo.png"}
                alt="Logo"
                width={140}
                height={50}
                className="object-contain"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <SearchBar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center flex-1 md:flex-none justify-end gap-1 md:gap-2">
            {/* Mobile Search Toggle & Bar */}
            <MobileSearch isOpen={isMobileSearchOpen} setIsOpen={setIsMobileSearchOpen} />

            {/* Account Actions with Vertical Labels */}
            <AccountActions cartItems={cartItems} />
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        {children}
      </div>
    </header>
  );
};

export default MainHeader;