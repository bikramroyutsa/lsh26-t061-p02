import type { Metadata } from "next";
import { Outfit, Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { PharmacyProvider } from "@/context/PharmacyContext";
import { AuthProvider } from "@/context/AuthContext";
import AppAuthWrapper from "@/components/layout/AppAuthWrapper";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MediShelf — Khulna Pharmacy",
  description:
    "Inventory expiry monitoring and financial risk tracking dashboard for Khulna Pharmacy, Bangladesh.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${dmMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans antialiased pb-20 md:pb-0">
        {/* Paper grain texture overlay — the soul of the botanical aesthetic */}
        <div
          className="pointer-events-none fixed inset-0 z-[100] opacity-[0.018]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
          aria-hidden="true"
        />
        <AuthProvider>
          <PharmacyProvider>
            <AppAuthWrapper>
              <Header />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
                {children}
              </main>
              <BottomNav />
            </AppAuthWrapper>
          </PharmacyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
