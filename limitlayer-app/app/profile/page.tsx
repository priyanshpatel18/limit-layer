"use client";

import { Nav } from "@/components/Nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWallet } from "@solana/wallet-adapter-react";
import { useReputation } from "@/hooks";

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const { data: reputation } = useReputation();

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold tracking-tight">Profile</h1>

        {!connected ? (
          <Card>
            <CardHeader>
              <CardTitle>Connect your wallet</CardTitle>
              <CardDescription>
                Connect your Solana wallet to view your profile and reputation.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
                <CardDescription>Your connected Solana address</CardDescription>
              </CardHeader>
              <CardContent>
                <code className="block break-all rounded bg-muted px-2 py-1 font-mono text-sm">
                  {publicKey?.toBase58()}
                </code>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reputation</CardTitle>
                <CardDescription>
                  Limit Layer abuse reputation for this wallet
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
                    No reputation account yet. Your reputation will be created
                    when you use the protocol or receive abuse signals.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
