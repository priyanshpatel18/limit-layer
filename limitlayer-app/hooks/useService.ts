"use client";

import { useQuery } from "@tanstack/react-query";
import { useProgram } from "./useProgram";
import { servicePda } from "@/lib/limitlayer/pda";

export function useService(serviceCount: number | null) {
  const program = useProgram();

  return useQuery({
    queryKey: ["limitlayer", "service", serviceCount ?? -1],
    queryFn: async () => {
      if (!program || serviceCount == null || serviceCount < 0) return null;
      const [pda] = servicePda(program.programId, serviceCount);
      return program.account.serviceAccount.fetch(pda);
    },
    enabled: !!program && serviceCount != null && serviceCount >= 0,
    refetchInterval: 30_000,
  });
}
