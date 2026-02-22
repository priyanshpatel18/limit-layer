"use client";

import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProtocol, useReputation } from "@/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { connected } = useWallet();
  const { data: protocol, isLoading: protocolLoading } = useProtocol();
  const { data: reputation } = useReputation();

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">Dashboard</h1>

        {!connected ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect your wallet</CardTitle>
              <CardDescription>
                Connect your Solana wallet to view protocol stats and your
                reputation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the button in the header to connect.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Protocol overview */}
            <Card>
              <CardHeader>
                <CardTitle>Protocol</CardTitle>
                <CardDescription>
                  Limit Layer protocol state on Devnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {protocolLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : protocol ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Fee (bps)</dt>
                      <dd className="font-mono">{protocol.protocolFeeBps}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Services</dt>
                      <dd className="font-mono">
                        {protocol.serviceCount?.toNumber?.() ?? 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">API keys</dt>
                      <dd className="font-mono">
                        {protocol.apiKeyCount?.toNumber?.() ?? 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Paused</dt>
                      <dd className="font-mono">
                        {protocol.paused ? "Yes" : "No"}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Protocol not initialized or failed to load.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Reputation */}
            <Card>
              <CardHeader>
                <CardTitle>Your Reputation</CardTitle>
                <CardDescription>
                  On-chain abuse reputation for your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reputation ? (
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Global score</dt>
                      <dd className="font-mono">
                        {reputation.globalScore?.toNumber?.() ?? 0}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No reputation account yet. Submit usage and stay within limits
                    to maintain a clean reputation.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>
                  Jump to profile or instruction testing
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link href="/profile" className="gap-2">
                    Profile
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/develop" className="gap-2">
                    Instruction tests
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
