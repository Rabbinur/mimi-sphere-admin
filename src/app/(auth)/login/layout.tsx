import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Shopping Cart BD",
  description: "Securely sign in to your Shopping Cart BD account to track orders and manage your sourcing requests.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
