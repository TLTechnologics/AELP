import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "AELP - Adaptive English Learning",
  description: "Personalized AI-powered English learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@700,500,400&display=swap" rel="stylesheet" />
      </head>
      <body className={`${anton.variable} font-sans antialiased bg-muted text-foreground bg-grid-pattern min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
