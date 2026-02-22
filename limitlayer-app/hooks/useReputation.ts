"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "./useProgram";
import { reputationPda } from "@/lib/limitlayer/pda";

export function useReputation() {
  const program = useProgram();
  const { publicKey } = useWallet();

  return useQuery({
    queryKey: ["limitlayer", "reputation", publicKey?.toBase58() ?? ""],
    queryFn: async () => {
      if (!program || !publicKey) return null;
      const pda = reputationPda(program.programId, publicKey);
      try {
        return await program.account.reputationAccount.fetch(pda);
      } catch {
        return null;
      }
    },
    enabled: !!program && !!publicKey,
    refetchInterval: 30_000,
  });
}
