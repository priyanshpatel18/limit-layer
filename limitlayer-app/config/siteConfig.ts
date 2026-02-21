import { Metadata } from "next";

const BASE_URL = "https://limitlayer.superteam.life";

const { title, description } = {
  title: "Limit Layer | Verifiable Rate Limiting on Solana",
  description:
    "Limit Layer moves rate limiting and abuse detection into a shared deterministic state machine on Solana. Verifiable enforcement, portable API identity, and composable infrastructure for Web3.",
};

export const siteConfig: Metadata = {
  title: {
    default: title,
    template: "%s | Limit Layer",
  },
  description,
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Limit Layer",
    title,
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Limit Layer — Verifiable Rate Limiting on Solana",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  applicationName: "Limit Layer",
  alternates: {
    canonical: BASE_URL,
  },
  keywords: [
    "Limit Layer",
    "rate limiting",
    "Solana",
    "abuse detection",
    "Web3 infrastructure",
    "verifiable enforcement",
    "API identity",
    "blockchain rate limit",
    "Solana program",
    "delegated execution",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};
