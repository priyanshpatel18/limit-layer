"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { useProgram } from "./useProgram";
import { apiKeyPda, delegatedUsagePda } from "@/lib/limitlayer/pda";
import type { LimitLayerProgram } from "@/lib/limitlayer/program";

export type DelegatedUsageInfo = {
  index: number;
  delegated: boolean;
  currentWindowUsage: number;
  delegatedAt: number | null;
};

async function fetchDelegatedUsageForUser(
  program: LimitLayerProgram,
  connection: ReturnType<typeof useConnection>["connection"],
  apiKeyIndices: number[]
): Promise<DelegatedUsageInfo[]> {
  const results: DelegatedUsageInfo[] = [];

  for (const i of apiKeyIndices) {
    try {
      const apiKeyPdaKey = apiKeyPda(program.programId, i);
      const delegatedUsagePdaKey = delegatedUsagePda(
        program.programId,
        apiKeyPdaKey
      );
      const accountInfo = await connection.getAccountInfo(delegatedUsagePdaKey);

      if (!accountInfo || !accountInfo.data) {
        results.push({
          index: i,
          delegated: false,
          currentWindowUsage: 0,
          delegatedAt: null,
        });
        continue;
      }

      const delegatedAccount =
        await program.account.delegatedUsageAccount.fetch(delegatedUsagePdaKey);

      results.push({
        index: i,
        delegated: delegatedAccount.delegated,
        currentWindowUsage:
          delegatedAccount.currentWindowUsage?.toNumber?.() ?? 0,
        delegatedAt: delegatedAccount.delegatedAt
          ? Number(delegatedAccount.delegatedAt)
          : null,
      });
    } catch {
      results.push({
        index: i,
        delegated: false,
        currentWindowUsage: 0,
        delegatedAt: null,
      });
    }
  }

  return results;
}

export function useDelegatedUsage(apiKeyIndices: number[] = []) {
  const program = useProgram();
  const { connection } = useConnection();

  return useQuery({
    queryKey: [
      "limitlayer",
      "delegated-usage",
      ...apiKeyIndices.map(String).sort(),
    ],
    queryFn: () =>
      program && apiKeyIndices.length > 0
        ? fetchDelegatedUsageForUser(program, connection, apiKeyIndices)
        : Promise.resolve([]),
    enabled: !!program && apiKeyIndices.length > 0,
  });
}
