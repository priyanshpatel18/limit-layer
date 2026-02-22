"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./useProgram";
import { protocolPda, servicePda } from "@/lib/limitlayer/pda";
import type { LimitLayerProgram } from "@/lib/limitlayer/program";

async function fetchUserServices(
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
  const count = protocol.serviceCount.toNumber();
  const results: { index: number; name: string; status: string }[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const [pda] = servicePda(program.programId, i);
      const service = await program.account.serviceAccount.fetch(pda);
      if (service.authority.equals(publicKey)) {
        const raw =
          service.status && typeof service.status === "object"
            ? (Object.keys(service.status)[0] ?? "unknown")
            : String(service.status);
        const status =
          raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
        results.push({
          index: i,
          name: service.name,
          status,
        });
      }
    } catch {
      // Account may not exist, skip
    }
  }
  return results;
}

export function useUserServices() {
  const program = useProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["limitlayer", "user-services", publicKey?.toBase58() ?? ""],
    queryFn: () =>
      program && publicKey
        ? fetchUserServices(program, publicKey)
        : Promise.resolve([]),
    enabled: !!program && !!publicKey,
  });
}
