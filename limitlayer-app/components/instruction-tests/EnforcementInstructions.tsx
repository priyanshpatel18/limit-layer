"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import {
  apiKeyPda,
  delegatedUsagePda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function EnforcementInstructions() {
  const { program, isReady } = useLimitLayer();
  const [loading, setLoading] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState("0");
  const [apiKeyIndex, setApiKeyIndex] = useState("");

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
  }, [program, serviceIndex, apiKeyIndex]);

  const manualBlockKey = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .manualBlockKey()
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        apiKey,
      })
      .rpc();
  }, [program, serviceIndex, apiKeyIndex]);

  const manualUnblockKey = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .manualUnblockKey()
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        apiKey,
      })
      .rpc();
  }, [program, serviceIndex, apiKeyIndex]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Enforcement"
      description="Evaluate enforcement, manual block/unblock"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Service & API Key</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Service index"
            value={serviceIndex}
            onChange={(e) => setServiceIndex(e.target.value)}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="API key index"
            value={apiKeyIndex}
            onChange={(e) => setApiKeyIndex(e.target.value)}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm"
          />
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
