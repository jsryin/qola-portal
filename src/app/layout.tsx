import type { Metadata } from "next";
import "./globals.css";
import { cn, getAssetPath } from "@/lib/utils";
import { montserrat } from "./fonts/fonts";
import { GoogleAnalytics } from "@next/third-parties/google";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://qola.com"),
  title: "QOLA｜QOLA Mall",
  description: "QOLA",
  icons: {
    icon: { url: getAssetPath("/logo-100x100.webp"), type: "image/webp" },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Extract language from pathname (e.g., /ae/en or /cn/zh)
  const parts = pathname.split('/').filter(Boolean);
  let lang = 'en'; // default
  if (parts.length >= 2) {
    lang = parts[1];
  } else if (parts.length === 1 && parts[0] === 'ar') {
    lang = 'ar';
  }

  return (
    <html lang={lang} className={montserrat.variable} suppressHydrationWarning>
      <body className={cn(montserrat.className, "antialiased bg-background text-foreground min-h-screen")}>
        {children}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-XYZ"} />
      </body>
    </html>
  );
}
