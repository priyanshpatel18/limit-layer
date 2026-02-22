"use client";

import { useQuery } from "@tanstack/react-query";
import { useProgram } from "./useProgram";
import { protocolPda } from "@/lib/limitlayer/pda";

export function useProtocol() {
  const program = useProgram();

  return useQuery({
    queryKey: ["limitlayer", "protocol"],
    queryFn: async () => {
      if (!program) return null;
      const pda = protocolPda(program.programId);
      return program.account.protocolState.fetch(pda);
    },
    enabled: !!program,
    refetchInterval: 30_000,
  });
}
