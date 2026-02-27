import type { Metadata } from "next";
import "./globals.css";
import { cn, getAssetPath } from "@/lib/utils";
import { montserrat } from "./fonts/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "QOLA｜QOLA Mall",
  description: "QOLA",
  icons: {
    icon: { url: getAssetPath("/logo-100x100.webp"), type: "image/webp" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={montserrat.variable}>
      <body className={cn(montserrat.className, "antialiased bg-background text-foreground min-h-screen")}>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-XYZ"} />
      </body>
    </html>
  );
}
