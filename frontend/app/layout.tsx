import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";

import { AuthProvider } from "@/lib/auth-context";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "DiaSense",
  description: "Diabetes risk prediction and health insights platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sora.variable} font-[var(--font-sans)] antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
