"use client";

import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import {
  StatIconRadar,
  StatIconSun,
  StatIconTick
} from "@/components/StatIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Anchor,
  ArrowRight,
  Gauge,
  Shield,
  Zap
} from "lucide-react";
import Link from "next/link";

const BENTO_ITEMS = [
  {
    type: "feature",
    span: "wide",
    icon: Shield,
    title: "Verifiable Rate Limiting",
    description:
      "Deterministic, on-chain state for rate limits. No opaque backends — prove enforcement.",
  },
  {
    type: "feature",
    span: "std",
    icon: Zap,
    title: "Ultra-Low Latency",
    description: "Optimized for high-frequency trading and high-traffic dApps on Solana.",
  },
  {
    type: "feature",
    span: "std",
    icon: Anchor,
    title: "Anchor Native",
    description: "Deep integration with Anchor macros for easy implementation in hours.",
  },
  {
    type: "feature",
    span: "wide",
    icon: Gauge,
    title: "Shared State Machine",
    description:
      "One protocol, many services. Composable infrastructure for Web3.",
  },
];

const STATS = [
  {
    label: "Network",
    value: "Solana Devnet",
    icon: StatIconSun,
  },
  {
    label: "Environment",
    value: "Devnet Active",
    icon: StatIconRadar,
  },
  {
    label: "Framework",
    value: "Anchor Native",
    icon: Anchor,
  },
  {
    label: "Status",
    value: "Operational",
    icon: StatIconTick,
  },
];

const FOOTER_LINKS = {
  Product: [
    { label: "DASHBOARD", href: "/dashboard" },
    { label: "PROFILE", href: "/profile" },
    { label: "DEVELOP", href: "/develop" },
  ]
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      <main className="flex-1">
        <section className="relative flex min-h-[calc(100vh-theme(spacing.14))] flex-col items-center justify-center overflow-hidden px-4">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, color-mix(in srgb, var(--primary) 12%, transparent), transparent 40%), radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--primary) 8%, transparent), transparent), radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--primary) 6%, transparent), transparent 70%)",
            }}
          />

          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <Badge className="mb-4 text-sm font-medium uppercase tracking-wide text-primary bg-primary/10 px-5">
              Verifiable rate limiting on Solana
            </Badge>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl md:text-8xl">
              Limit. Verify.
              <br />
              <span className="text-primary">On-chain.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
              The verifiable rate limiting protocol built for the Solana ecosystem.
              Secure your high-performance infrastructure with Anchor-integrated
              speed and cryptographic proof.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button
                asChild variant="outline"
                size="lg"
                className="border-primary text-primary bg-transparent hover:bg-primary/10 hover:text-primary"
              >
                <Link href="/develop" className="flex items-center gap-2">
                  Develop
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-y px-6 py-10">
          <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 md:grid-cols-4">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="space-y-2">
                <div className="text-xs uppercase tracking-widest text-primary/40">
                  {label}
                </div>

                <div className="flex items-center gap-3 text-lg font-semibold text-primary">
                  <Icon className="size-5 shrink-0" />
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-16 px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-4xl">
              <h2 className="text-4xl font-semibold tracking-tighter sm:text-6xl">
                Infrastructure-Grade Security
              </h2>
              <p className="mt-2 text-muted-foreground text-lg tracking-tighter max-w-xl">
                Engineered specifically for high-throughput Solana programs requiring sub-millisecond
                validation.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {BENTO_ITEMS.map((item) => {
                const Icon = item.icon as React.ComponentType<{ className?: string }>;
                const isWide = item.span === "wide";
                return (
                  <Card
                    key={item.title}
                    className={`overflow-hidden ${isWide ? "sm:col-span-2" : ""}`}
                  >
                    <CardHeader className="flex flex-row items-start gap-4 p-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/10">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="px-4 py-14 max-w-6xl mx-auto rounded-2xl"
          style={{
            background: "linear-gradient(to right, var(--primary), var(--secondary-foreground))",
          }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Secure Your Protocol.
            </h2>
            <p className="mt-4 text-white/90 text-lg">
              Start building with the industry-standard rate limiting protocol on Solana. Join
              50+ high-scale protocols already protected by Limit Layer.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 hover:text-primary">
                <Link href="/dashboard">Deploy Integration</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white bg-transparent hover:bg-white/10 hover:text-white"
                disabled={true}
              >
                <Link href="https://github.com/priyanshpatel18/limit-layer">Github</Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <Logo />
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                  Verifiable on-chain rate limiting for the next generation of high-throughput applications.
                </p>
              </div>
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div key={group}>
                  <h3 className="text-sm font-semibold text-foreground">
                    {group}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {links.map(({ label, href }) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} LIMITLAYER. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
