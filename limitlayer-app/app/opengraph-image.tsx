import { ImageResponse } from "next/og";
import { palette } from "@/config/theme";

export const alt = "Limit Layer — Verifiable Rate Limiting on Solana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: `linear-gradient(135deg, ${palette.nearblack} 0%, ${palette.navy} 100%)`,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div
            style={{
              color: palette.saffron,
              fontWeight: 700,
              fontSize: 56,
              letterSpacing: "-0.02em",
            }}
          >
            Limit Layer
          </div>
          <div
            style={{
              color: palette.cream,
              fontSize: 28,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Verifiable rate limiting and abuse detection on Solana
          </div>
          <div
            style={{
              color: palette.cream,
              opacity: 0.8,
              fontSize: 20,
              marginTop: 16,
            }}
          >
            Shared state machine • Portable API identity • Deterministic enforcement
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
