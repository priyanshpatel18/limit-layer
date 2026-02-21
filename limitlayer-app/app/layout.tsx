import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/siteConfig";
import { QueryProvider } from "@/providers/QueryProvider";
import { SolanaProvider } from "@/providers/SolanaProvider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = siteConfig;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Limit Layer",
  url: "https://limitlayer.superteam.life",
  description:
    "Verifiable rate limiting and abuse detection on Solana. Shared state machine, portable API identity, and deterministic enforcement.",
  inLanguage: "en",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SolanaProvider>
          <QueryProvider>{children}</QueryProvider>
        </SolanaProvider>
        <Toaster />
      </body>
    </html>
  );
}
