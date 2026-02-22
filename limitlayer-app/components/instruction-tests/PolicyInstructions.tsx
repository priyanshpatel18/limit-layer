"use client";

import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import { useUserServices } from "@/hooks/useUserServices";
import {
  policyPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function PolicyInstructions() {
  const { program, isReady } = useLimitLayer();
  const { data: userServices = [] } = useUserServices();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState("0");
  const [requestsPerWindow, setRequestsPerWindow] = useState("100");
  const [windowSeconds, setWindowSeconds] = useState("60");
  const [burstLimit, setBurstLimit] = useState("20");
  const [costPerRequest, setCostPerRequest] = useState("1000");
  const [newRequests, setNewRequests] = useState("200");
  const [newWindow, setNewWindow] = useState("120");

  useEffect(() => {
    if (userServices.length > 0 && !userServices.some((s) => s.index.toString() === selectedServiceIndex)) {
      setSelectedServiceIndex(userServices[0].index.toString());
    }
  }, [userServices, selectedServiceIndex]);

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
    const idx = parseInt(selectedServiceIndex, 10);
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
    selectedServiceIndex,
    requestsPerWindow,
    windowSeconds,
    burstLimit,
    costPerRequest,
  ]);

  const updatePolicy = useCallback(async () => {
    if (!program) return;
    const idx = parseInt(selectedServiceIndex, 10);
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
  }, [program, selectedServiceIndex, newRequests, newWindow]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Policy"
      description="Create and update rate limit policies"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Create Policy</label>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Service</label>
            <select
              value={selectedServiceIndex}
              onChange={(e) => setSelectedServiceIndex(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm"
            >
              {userServices.length > 0 ? (
                userServices.map((s) => (
                  <option key={s.index} value={s.index}>
                    {s.name} (#{s.index})
                  </option>
                ))
              ) : (
                <option value="0">Service 0</option>
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Requests per window</label>
            <input
              type="number"
              placeholder="100"
              value={requestsPerWindow}
              onChange={(e) => setRequestsPerWindow(e.target.value)}
              className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Window (seconds)</label>
            <input
              type="number"
              placeholder="60"
              value={windowSeconds}
              onChange={(e) => setWindowSeconds(e.target.value)}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Burst limit</label>
            <input
              type="number"
              placeholder="20"
              value={burstLimit}
              onChange={(e) => setBurstLimit(e.target.value)}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Cost per request</label>
            <input
              type="number"
              placeholder="1000"
              value={costPerRequest}
              onChange={(e) => setCostPerRequest(e.target.value)}
              className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <TxButton
            label="Create Policy"
            loading={loading === "create"}
            onClick={() => run("create", createPolicy)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Policy</label>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Service</label>
            <select
              value={selectedServiceIndex}
              onChange={(e) => setSelectedServiceIndex(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm"
            >
              {userServices.length > 0 ? (
                userServices.map((s) => (
                  <option key={s.index} value={s.index}>
                    {s.name} (#{s.index})
                  </option>
                ))
              ) : (
                <option value="0">Service 0</option>
              )}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Requests per window</label>
            <input
              type="number"
              placeholder="200"
              value={newRequests}
              onChange={(e) => setNewRequests(e.target.value)}
              className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Window (seconds)</label>
            <input
              type="number"
              placeholder="120"
              value={newWindow}
              onChange={(e) => setNewWindow(e.target.value)}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
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
