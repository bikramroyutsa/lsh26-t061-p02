import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PharmacyProvider } from "@/context/PharmacyContext";
import { AuthProvider } from "@/context/AuthContext";
import AppAuthWrapper from "@/components/layout/AppAuthWrapper";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pharmacy Expiry Shelf Check - Khulna Pharmacy",
  description: "Inventory expiry monitoring and financial risk tracking dashboard for Khulna Pharmacy, Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-sans">
        <AuthProvider>
          <AppAuthWrapper>
            <PharmacyProvider>
              <Header />
              <Navigation />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {children}
              </main>
            </PharmacyProvider>
          </AppAuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
