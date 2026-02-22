"use client";

import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import {
  policyPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function PolicyInstructions() {
  const { program, isReady } = useLimitLayer();
  const [loading, setLoading] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState("0");
  const [requestsPerWindow, setRequestsPerWindow] = useState("100");
  const [windowSeconds, setWindowSeconds] = useState("60");
  const [burstLimit, setBurstLimit] = useState("20");
  const [costPerRequest, setCostPerRequest] = useState("1000");
  const [newRequests, setNewRequests] = useState("200");
  const [newWindow, setNewWindow] = useState("120");

  const run = useCallback(
    async (name: string, fn: () => Promise<string | void>) => {
      if (!program) {
        toast.error("Connect wallet first");
        return;
      }
      setLoading(name);
      try {
        const sig = await fn();
        if (sig) toast.success(`Success`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        toast.error(msg);
      } finally {
        setLoading(null);
      }
    },
    [program]
  );

  const createPolicy = useCallback(async () => {
    if (!program) return;
    const idx = parseInt(serviceIndex, 10);
    const [servicePdaKey] = servicePda(PROGRAM_ID, idx);
    const service = await program.account.serviceAccount.fetch(servicePdaKey);
    const policy = policyPda(PROGRAM_ID, servicePdaKey, service.totalUsageUnits);
    return program.methods
      .createPolicy(
        new BN(requestsPerWindow),
        new BN(windowSeconds),
        new BN(burstLimit),
        new BN(costPerRequest)
      )
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        policy,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  }, [
    program,
    serviceIndex,
    requestsPerWindow,
    windowSeconds,
    burstLimit,
    costPerRequest,
  ]);

  const updatePolicy = useCallback(async () => {
    if (!program) return;
    const idx = parseInt(serviceIndex, 10);
    const [servicePdaKey] = servicePda(PROGRAM_ID, idx);
    const service = await program.account.serviceAccount.fetch(servicePdaKey);
    const policy = policyPda(PROGRAM_ID, servicePdaKey, service.totalUsageUnits);
    return program.methods
      .updatePolicy(
        new BN(newRequests),
        new BN(newWindow),
        null,
        null
      )
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        policy,
      })
      .rpc();
  }, [program, serviceIndex, newRequests, newWindow]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Policy"
      description="Create and update rate limit policies"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Create Policy</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Service index"
            value={serviceIndex}
            onChange={(e) => setServiceIndex(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Req/window"
            value={requestsPerWindow}
            onChange={(e) => setRequestsPerWindow(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Window (s)"
            value={windowSeconds}
            onChange={(e) => setWindowSeconds(e.target.value)}
            className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Burst"
            value={burstLimit}
            onChange={(e) => setBurstLimit(e.target.value)}
            className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Cost/req"
            value={costPerRequest}
            onChange={(e) => setCostPerRequest(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <TxButton
            label="Create Policy"
            loading={loading === "create"}
            onClick={() => run("create", createPolicy)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Policy</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Req/window"
            value={newRequests}
            onChange={(e) => setNewRequests(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Window (s)"
            value={newWindow}
            onChange={(e) => setNewWindow(e.target.value)}
            className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
          />
          <TxButton
            label="Update"
            loading={loading === "update"}
            onClick={() => run("update", updatePolicy)}
          />
        </div>
      </div>
    </InstructionCard>
  );
}
