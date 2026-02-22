"use client";

import { useQuery } from "@tanstack/react-query";
import { useProgram } from "./useProgram";
import { apiKeyPda, delegatedUsagePda } from "@/lib/limitlayer/pda";

export function useDelegatedUsageAccount(apiKeyIndex: string | number | undefined) {
  const program = useProgram();
  const index = apiKeyIndex === "" ? undefined : apiKeyIndex;

  return useQuery({
    queryKey: ["limitlayer", "delegated-usage-account", program?.programId.toBase58(), index],
    queryFn: async () => {
      if (!program || index === undefined) return null;
      const idx = typeof index === "string" ? parseInt(index, 10) : index;
      if (isNaN(idx) || idx < 0) return null;
      try {
        const apiKeyPdaKey = apiKeyPda(program.programId, idx);
        const delegatedUsagePdaKey = delegatedUsagePda(program.programId, apiKeyPdaKey);
        return program.account.delegatedUsageAccount.fetch(delegatedUsagePdaKey);
      } catch {
        return null;
      }
    },
    enabled: !!program && index !== undefined && !isNaN(parseInt(String(index), 10)),
  });
}
