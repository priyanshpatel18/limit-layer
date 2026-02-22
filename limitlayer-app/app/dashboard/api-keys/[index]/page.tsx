"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApiKey, useDelegatedUsageAccount } from "@/hooks";
import { ArrowLeft } from "lucide-react";

function formatTs(ts: number | bigint | undefined): string {
  if (ts === undefined || ts === null) return "—";
  const n = Number(ts);
  if (n === 0) return "—";
  try {
    return new Date(n * 1000).toLocaleString();
  } catch {
    return String(n);
  }
}

function getStatusLabel(status: unknown): string {
  if (!status) return "Unknown";
  const raw =
    status && typeof status === "object"
      ? Object.keys(status as object)[0] ?? "unknown"
      : String(status);
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export default function ApiKeyMonitorPage() {
  const params = useParams();
  const router = useRouter();
  const index = params.index as string;

  const { data: apiKey, isLoading: apiKeyLoading, error: apiKeyError } = useApiKey(index);
  const { data: delegatedUsage } = useDelegatedUsageAccount(index);

  if (!index) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-muted-foreground">Invalid API key index.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  if (apiKeyError || (apiKeyLoading === false && !apiKey)) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-muted-foreground">
            API key #{index} not found or failed to load.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 size-4" />
              Back to Dashboard
            </Link>
          </Button>
        </main>
      </div>
    );
  }

  const lifetimeUsage = apiKey?.lifetimeUsage;
  const lifetimeUsageStr =
    lifetimeUsage !== undefined && lifetimeUsage !== null
      ? typeof lifetimeUsage === "bigint"
        ? lifetimeUsage.toString()
        : String(lifetimeUsage)
      : "0";

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <h1 className="mb-8 text-2xl font-bold tracking-tight">
          API Key #{index} Monitor
        </h1>

        {apiKeyLoading || !apiKey ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="space-y-6">
            {/* API Key Account */}
            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>
                  On-chain API key account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium">{getStatusLabel(apiKey.status)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-mono text-xs break-all">{apiKey.service.toBase58()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Owner</dt>
                    <dd className="font-mono text-xs break-all">{apiKey.owner.toBase58()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Policy</dt>
                    <dd className="font-mono text-xs break-all">{apiKey.policy.toBase58()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Reputation</dt>
                    <dd className="font-mono text-xs break-all">{apiKey.reputation.toBase58()}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Lifetime usage</dt>
                    <dd className="font-mono">{lifetimeUsageStr}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Last checkpoint</dt>
                    <dd className="font-mono text-xs">{formatTs(apiKey.lastCheckpointTs)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Delegated Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Usage (Delegated)</CardTitle>
                <CardDescription>
                  Real-time usage state when delegated to execution region
                </CardDescription>
              </CardHeader>
              <CardContent>
                {delegatedUsage ? (
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Delegated</dt>
                      <dd className="font-medium">{delegatedUsage.delegated ? "Yes" : "No"}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Current window usage</dt>
                      <dd className="font-mono">{delegatedUsage.currentWindowUsage?.toNumber?.() ?? 0}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Burst counter</dt>
                      <dd className="font-mono">{delegatedUsage.burstCounter?.toNumber?.() ?? 0}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Window start</dt>
                      <dd className="font-mono text-xs">{formatTs(delegatedUsage.windowStartTs)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Last update</dt>
                      <dd className="font-mono text-xs">{formatTs(delegatedUsage.lastUpdateTs)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Delegated at</dt>
                      <dd className="font-mono text-xs">{formatTs(delegatedUsage.delegatedAt)}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Delegation seq</dt>
                      <dd className="font-mono">{delegatedUsage.delegationSeq?.toNumber?.() ?? 0}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No delegated usage account or not yet delegated.
                  </p>
                )}
              </CardContent>
            </Card>

            <Button asChild variant="outline">
              <Link href="/develop" className="gap-2">
                Manage via Develop
                <ArrowLeft className="size-4 rotate-180" />
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
