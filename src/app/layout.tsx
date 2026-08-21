import Script from 'next/script';
import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/query-provider";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "AELP - Adaptive English Learning",
  description: "Personalized AI-powered English learning platform.",
};

import { ThemeProvider } from "@/components/providers/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" rel="stylesheet" />
      </head>
      <body className={`${anton.variable} font-sans antialiased bg-background text-foreground bg-grid-pattern min-h-screen flex flex-col`}>
        <Script src="https://cdn.jsdelivr.net/npm/eruda" strategy="beforeInteractive" />
        <Script id="eruda-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: 'if (typeof eruda !== "undefined") eruda.init();' }} />


        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
