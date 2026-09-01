"use client";

import {
    ChevronRight,
    Home,
    Mail,
    Menu,
    MessageSquare,
    PackageCheck,
    Phone,
    ShoppingBag
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// Project Specific Imports
import { cmsData } from "@/constants/cms";

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export const MobileMenu = ({ isOpen, setIsOpen }: MobileMenuProps) => {
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button
                    aria-label="Open navigation menu"
                    className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] flex flex-col p-0 bg-white border-r-0">
                <VisuallyHidden.Root>
                    <SheetHeader>
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>
                            Browse categories and site links.
                        </SheetDescription>
                    </SheetHeader>
                </VisuallyHidden.Root>

                <div className="p-4 border-b flex items-center justify-between">
                    <Image
                        src={"/logo.png"}
                        alt="Logo"
                        width={140}
                        height={35}
                        className="object-contain"
                        style={{ width: 'auto', height: 'auto' }}
                        priority
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Explore</p>
                    <MobileNavLink href="/" label="Home" icon={Home} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/shop" label="Shop" icon={ShoppingBag} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/categories" label="Categories" icon={ShoppingBag} onClick={() => setIsOpen(false)} />
                    {/* <MobileNavLink href="/custom-order" label="Custom Order" icon={Sparkles} isNew onClick={() => setIsOpen(false)} /> */}
                    <MobileNavLink href="/track-order" label="Track Order" icon={PackageCheck} onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/contact" label="Contact Us" icon={MessageSquare} onClick={() => setIsOpen(false)} />

                    <Separator className="my-6 opacity-50" />

                    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Info</p>
                    <div className="px-3 space-y-4">
                        <ContactItem icon={Phone} label={cmsData?.company?.phone || "+880 1722597565"} type="tel" />
                        <ContactItem icon={Mail} label={cmsData?.company?.email || "info@shoppingcart.bd"} type="mail" />
                    </div>
                </div>

                <div className="p-4 border-t bg-slate-50 mt-auto">
                    <Link href="/user-account" onClick={() => setIsOpen(false)}>
                        <Button className="w-full font-bold rounded-xl h-11">
                            My Account
                        </Button>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
};

/* ---------------- Helper Components ---------------- */

const MobileNavLink = ({ href, label, isNew, icon: Icon, onClick }: { href: string; label: string; isNew?: boolean; icon: any; onClick: () => void }) => (
    <Link
        href={href}
        onClick={onClick}
        className="group flex items-center justify-between w-full p-2 text-sm font-semibold rounded-xl hover:bg-primary/5 transition-all"
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-white group-hover:shadow-sm transition-all text-slate-500 group-hover:text-primary">
                <Icon size={18} />
            </div>
            <span className="text-slate-700 group-hover:text-primary">{label}</span>
            {isNew && (
                <span className="bg-primary text-white px-1.5 py-0.5 text-[8px] font-black rounded uppercase">New</span>
            )}
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:text-primary" />
    </Link>
);

const ContactItem = ({ icon: Icon, label, type }: { icon: any; label: string; type: "tel" | "mail" }) => (
    <a
        href={type === "tel" ? `tel:${label}` : `mailto:${label}`}
        className="flex items-center gap-3 text-sm text-slate-600 hover:text-primary transition-colors py-1"
    >
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary shrink-0">
            <Icon size={14} />
        </div>
        <span className="truncate">{label}</span>
    </a>
);
