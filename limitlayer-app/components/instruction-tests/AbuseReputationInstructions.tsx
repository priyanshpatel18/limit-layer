"use client";

import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import {
  reputationPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function AbuseReputationInstructions() {
  const { program, isReady } = useLimitLayer();
  const [loading, setLoading] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState("0");
  const [subjectAddress, setSubjectAddress] = useState("");
  const [severity, setSeverity] = useState("5");
  const [category, setCategory] = useState("1"); // FLAG_SPAM = 1
  const [reputationDelta, setReputationDelta] = useState("-10");

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

  const emitAbuseSignal = useCallback(async () => {
    if (!program) return;
    const walletPk = program.provider.wallet!.publicKey;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
    const subject = subjectAddress ? new PublicKey(subjectAddress) : walletPk;
    const reputation = reputationPda(PROGRAM_ID, subject);
    return program.methods
      .emitAbuseSignal(parseInt(severity, 10), parseInt(category, 10))
      .accountsPartial({
        authority: walletPk,
        service: servicePdaKey,
        reputation,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  }, [program, serviceIndex, subjectAddress, severity, category]);

  const updateReputation = useCallback(async () => {
    if (!program) return;
    const walletPk = program.provider.wallet!.publicKey;
    const subject = subjectAddress ? new PublicKey(subjectAddress) : walletPk;
    const reputation = reputationPda(PROGRAM_ID, subject);
    return program.methods
      .updateReputation(new BN(parseInt(reputationDelta, 10)))
      .accountsPartial({
        reputation,
      })
      .rpc();
  }, [program, subjectAddress, reputationDelta]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Abuse & Reputation"
      description="Emit abuse signals, update reputation"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Emit Abuse Signal</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Service index"
            value={serviceIndex}
            onChange={(e) => setServiceIndex(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subjectAddress}
            onChange={(e) => setSubjectAddress(e.target.value)}
            className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <input
            type="number"
            placeholder="Severity 0-10"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="number"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
          />
          <TxButton
            label="Emit Signal"
            loading={loading === "emit"}
            onClick={() => run("emit", emitAbuseSignal)}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Category: 1=SPAM, 2=BOT, 4=SUSPICIOUS_BURST, 8=MANUAL_BLOCK
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Reputation</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Subject (optional)"
            value={subjectAddress}
            onChange={(e) => setSubjectAddress(e.target.value)}
            className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <input
            type="number"
            placeholder="Delta (e.g. -10)"
            value={reputationDelta}
            onChange={(e) => setReputationDelta(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <TxButton
            label="Update"
            loading={loading === "update"}
            onClick={() => run("update", updateReputation)}
          />
        </div>
      </div>
    </InstructionCard>
  );
}
