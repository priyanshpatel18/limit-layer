"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import { useUserServices } from "@/hooks/useUserServices";
import {
  apiKeyPda,
  delegatedUsagePda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function EnforcementInstructions() {
  const { program, isReady } = useLimitLayer();
  const { data: userServices = [] } = useUserServices();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState("0");
  const [apiKeyIndex, setApiKeyIndex] = useState("");

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

  const evaluateEnforcement = useCallback(async () => {
    if (!program) return;
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    const apiKeyAccount = await program.account.apiKeyAccount.fetch(apiKey);
    const policy = apiKeyAccount.policy;
    const delegatedUsage = delegatedUsagePda(PROGRAM_ID, apiKey);
    return program.methods
      .evaluateEnforcement()
      .accountsPartial({
        apiKey,
        policy,
        delegatedUsage,
      })
      .rpc();
  }, [program, selectedServiceIndex, apiKeyIndex]);

  const manualBlockKey = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .manualBlockKey()
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        apiKey,
      })
      .rpc();
  }, [program, selectedServiceIndex, apiKeyIndex]);

  const manualUnblockKey = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .manualUnblockKey()
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        apiKey,
      })
      .rpc();
  }, [program, selectedServiceIndex, apiKeyIndex]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Enforcement"
      description="Evaluate enforcement, manual block/unblock"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Service & API Key</label>
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
            <label className="text-xs font-medium text-muted-foreground">API key index</label>
            <input
              type="number"
              placeholder="0"
              value={apiKeyIndex}
              onChange={(e) => setApiKeyIndex(e.target.value)}
              className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <TxButton
          label="Evaluate Enforcement"
          loading={loading === "evaluate"}
          onClick={() => run("evaluate", evaluateEnforcement)}
        />
        <TxButton
          label="Manual Block"
          variant="outline"
          loading={loading === "block"}
          onClick={() => run("block", manualBlockKey)}
        />
        <TxButton
          label="Manual Unblock"
          variant="outline"
          loading={loading === "unblock"}
          onClick={() => run("unblock", manualUnblockKey)}
        />
      </div>
    </InstructionCard>
  );
}
