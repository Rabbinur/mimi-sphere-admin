import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Mimi Sphere",
  description: "Securely sign in to your Mimi Sphere account to track orders and manage your sourcing requests.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
