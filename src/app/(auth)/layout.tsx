import GoogleAuthProvider from "@/components/Provider/GoogleAuthProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | Shopping Cart BD",
  description: "Sign in or create an account with Shopping Cart BD to manage your orders, wishlist, and sourcing requests.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      {children}
    </GoogleAuthProvider>
  );
}
