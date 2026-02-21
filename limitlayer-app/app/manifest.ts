import type { MetadataRoute } from "next";

import { palette } from "@/config/theme";

const baseUrl = "https://limitlayer.superteam.life";

const { appName, description } = {
  appName: "Limit Layer",
  description:
    "Verifiable rate limiting and abuse detection on Solana. Shared state machine, portable API identity, and deterministic enforcement for Web3 services.",
};

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: "Limit Layer",
    description,
    start_url: "/",
    scope: baseUrl,
    display: "standalone",
    background_color: palette.nearblack,
    theme_color: palette.saffron,
    orientation: "portrait-primary",
    lang: "en",
  };
}
