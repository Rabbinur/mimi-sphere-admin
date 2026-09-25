import GoogleAuthProvider from "@/components/Provider/GoogleAuthProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account | Mimi Sphere",
  description: "Sign in or create an account with Mimi Sphere to manage your orders, wishlist, and sourcing requests.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleAuthProvider>
      {children}
    </GoogleAuthProvider>
  );
}
