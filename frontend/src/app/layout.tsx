// declare module "*.css";

import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

import ToastProvider from "@/components/shared/ToastProvider";


export const metadata: Metadata = {
  title: "BEST International School ERP",
  description: "School Management System — BEST International School System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BEST ERP",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ToastProvider />
        </Providers>
      </body>
    </html>
  );
}