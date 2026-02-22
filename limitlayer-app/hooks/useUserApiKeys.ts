"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./useProgram";
import { apiKeyPda, protocolPda } from "@/lib/limitlayer/pda";
import type { LimitLayerProgram } from "@/lib/limitlayer/program";

async function fetchUserApiKeys(
  program: LimitLayerProgram,
  publicKey: ReturnType<typeof useWallet>["publicKey"]
) {
  if (!publicKey) return [];
  let protocol;
  try {
    protocol = await program.account.protocolState.fetch(
      protocolPda(program.programId)
    );
  } catch {
    return [];
  }
  const count = protocol.apiKeyCount.toNumber();
  const results: { index: number; status: string }[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const pda = apiKeyPda(program.programId, i);
      const apiKey = await program.account.apiKeyAccount.fetch(pda);
      if (apiKey.owner.equals(publicKey)) {
        const raw =
          apiKey.status && typeof apiKey.status === "object"
            ? (Object.keys(apiKey.status)[0] ?? "unknown")
            : String(apiKey.status);
        const status =
          raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        results.push({
          index: i,
          status,
        });
      }
    } catch {
      // Account may not exist, skip
    }
  }
  return results;
}

export function useUserApiKeys() {
  const program = useProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["limitlayer", "user-api-keys", publicKey?.toBase58() ?? ""],
    queryFn: () =>
      program && publicKey
        ? fetchUserApiKeys(program, publicKey)
        : Promise.resolve([]),
    enabled: !!program && !!publicKey,
  });
}
