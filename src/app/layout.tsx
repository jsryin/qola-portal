import type { Metadata } from "next";
import "./globals.css";
import { cn, getAssetPath } from "@/lib/utils";
import { montserrat } from "./fonts/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { DEFAULT_LANGUAGE } from "@/config/locales";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://qola.com"),
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
  const language = DEFAULT_LANGUAGE;

  return (
    <html
      lang={language}
      className={montserrat.variable}
      suppressHydrationWarning
    >
      <body
        className={cn(
          montserrat.className,
          "antialiased bg-background text-foreground min-h-screen"
        )}
      >
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-XYZ"} />
      </body>
    </html>
  );
}
