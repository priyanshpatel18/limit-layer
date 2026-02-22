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
import {
  useDelegatedUsage,
  useProtocol,
  useReputation,
  useUserApiKeys,
  useUserServices,
} from "@/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 10;

function PaginatedList<T extends { index: number }>({
  items,
  total,
  page,
  onPageChange,
  renderItem,
  emptyMessage,
}: {
  items: T[];
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = items.slice(start, start + PAGE_SIZE);

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2 text-sm">{pageItems.map(renderItem)}</ul>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">
            {start + 1}–{Math.min(start + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { data: protocol, isLoading: protocolLoading } = useProtocol();
  const { data: reputation } = useReputation();
  const { data: userServices, isLoading: servicesLoading } = useUserServices();
  const { data: userApiKeys, isLoading: apiKeysLoading } = useUserApiKeys();
  const apiKeyIndices = (userApiKeys ?? []).map((k) => k.index);
  const { data: delegatedUsage } = useDelegatedUsage(apiKeyIndices);

  const [servicesPage, setServicesPage] = useState(1);
  const [apiKeysPage, setApiKeysPage] = useState(1);

  const isProtocolAdmin =
    connected &&
    publicKey &&
    protocol &&
    protocol.adminAuthority.equals(publicKey);

  const userServicesList = userServices ?? [];
  const userApiKeysList = userApiKeys ?? [];
  const delegatedMap = new Map(
    (delegatedUsage ?? []).map((d) => [d.index, d])
  );

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
                Connect your Solana wallet to view your services, API keys, and
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
            {/* Your Reputation */}
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
                    No reputation account yet. Submit usage and stay within
                    limits to maintain a clean reputation.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Your Services */}
            <Card>
              <CardHeader>
                <CardTitle>Your Services</CardTitle>
                <CardDescription>
                  Services you created and manage
                </CardDescription>
              </CardHeader>
              <CardContent>
                {servicesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <PaginatedList
                    items={userServicesList}
                    total={userServicesList.length}
                    page={servicesPage}
                    onPageChange={setServicesPage}
                    emptyMessage="No services yet. Create one via the Develop page."
                    renderItem={(s) => (
                      <li key={s.index} className="flex justify-between">
                        <span className="font-medium">{s.name}</span>
                        <span className="font-mono text-muted-foreground">
                          #{s.index} · {s.status}
                        </span>
                      </li>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Your API Keys */}
            <Card>
              <CardHeader>
                <CardTitle>Your API Keys</CardTitle>
                <CardDescription>
                  API keys owned by your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeysLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <PaginatedList
                    items={userApiKeysList}
                    total={userApiKeysList.length}
                    page={apiKeysPage}
                    onPageChange={setApiKeysPage}
                    emptyMessage="No API keys yet. Create one via the Develop page."
                    renderItem={(k) => {
                      const delegated = delegatedMap.get(k.index);
                      return (
                        <li
                          key={k.index}
                          className="flex items-center justify-between gap-2"
                        >
                          <Link
                            href={`/dashboard/api-keys/${k.index}`}
                            className="font-mono text-primary hover:underline"
                          >
                            API Key #{k.index}
                          </Link>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {k.status}
                            {delegated && (
                              <>
                                <span className="text-border">·</span>
                                <span
                                  className={
                                    delegated.delegated
                                      ? "text-primary"
                                      : ""
                                  }
                                >
                                  {delegated.delegated
                                    ? `Delegated (${delegated.currentWindowUsage} usage)`
                                    : "Not delegated"}
                                </span>
                              </>
                            )}
                            <Link
                              href={`/dashboard/api-keys/${k.index}`}
                              className="text-primary hover:underline"
                            >
                              View details →
                            </Link>
                          </span>
                        </li>
                      );
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Protocol (admin only) */}
            {isProtocolAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Protocol (Admin)</CardTitle>
                  <CardDescription>
                    Limit Layer protocol state — visible because you are the
                    admin
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
            )}

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
