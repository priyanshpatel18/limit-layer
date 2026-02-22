"use client";

import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import { useUserServices } from "@/hooks/useUserServices";
import {
  reputationPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function AbuseReputationInstructions() {
  const { program, isReady } = useLimitLayer();
  const { data: userServices = [] } = useUserServices();
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState("0");
  const [subjectAddress, setSubjectAddress] = useState("");
  const [severity, setSeverity] = useState("5");
  const [category, setCategory] = useState("1"); // FLAG_SPAM = 1
  const [reputationDelta, setReputationDelta] = useState("-10");

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

  const emitAbuseSignal = useCallback(async () => {
    if (!program) return;
    const walletPk = program.provider.wallet!.publicKey;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
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
  }, [program, selectedServiceIndex, subjectAddress, severity, category]);

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
            <label className="text-xs font-medium text-muted-foreground">Subject (optional)</label>
            <input
              type="text"
              placeholder="Subject pubkey"
              value={subjectAddress}
              onChange={(e) => setSubjectAddress(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Severity (0–10)</label>
            <input
              type="number"
              placeholder="5"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <input
              type="number"
              placeholder="1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
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
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Subject (optional)</label>
            <input
              type="text"
              placeholder="Subject pubkey"
              value={subjectAddress}
              onChange={(e) => setSubjectAddress(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Reputation delta</label>
            <input
              type="number"
              placeholder="-10"
              value={reputationDelta}
              onChange={(e) => setReputationDelta(e.target.value)}
              className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
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
