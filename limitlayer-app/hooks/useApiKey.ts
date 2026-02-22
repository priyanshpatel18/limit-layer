"use client";

import { useQuery } from "@tanstack/react-query";
import { useProgram } from "./useProgram";
import { apiKeyPda } from "@/lib/limitlayer/pda";

export function useApiKey(apiKeyIndex: string | number | undefined) {
  const program = useProgram();
  const index = apiKeyIndex === "" ? undefined : apiKeyIndex;

  return useQuery({
    queryKey: ["limitlayer", "api-key", program?.programId.toBase58(), index],
    queryFn: async () => {
      if (!program || index === undefined) return null;
      const idx = typeof index === "string" ? parseInt(index, 10) : index;
      if (isNaN(idx) || idx < 0) return null;
      const pda = apiKeyPda(program.programId, idx);
      return program.account.apiKeyAccount.fetch(pda);
    },
    enabled: !!program && index !== undefined && !isNaN(parseInt(String(index), 10)),
  });
}
