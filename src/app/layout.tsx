import Provider from "@/components/Provider/MainProvider";
import type { Metadata } from "next";
import { Bai_Jamjuree } from "next/font/google";
import "./globals.css";

const baiJamjuree = Bai_Jamjuree({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-bai-jamjuree",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.shoppingcart.bd"),

  title: {
    default: "Admin Panel | Mimi Sphere",
    template: "%s | Admin Panel",
  },
  description: "Management console for Mimi Sphere",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Mimi Sphere | Premium Online Shopping in Bangladesh",
    description: "Shop the best products at Mimi Sphere...",
    url: "https://www.shoppingcart.bd",
    siteName: "Mimi Sphere",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Mimi Sphere",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mimi Sphere",
    description: "Your favorite online shopping destination in Bangladesh.",
    images: ["/og.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${baiJamjuree.variable} ${baiJamjuree.className} antialiased`}>
        <Provider>{children}</Provider>

      </body>
    </html>
  );
}
