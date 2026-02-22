"use client";

import * as anchor from "@coral-xyz/anchor";
import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import { protocolPda, PROGRAM_ID } from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function ProtocolInstructions() {
  const { program, isReady } = useLimitLayer();
  const [loading, setLoading] = useState<string | null>(null);
  const [protocolFeeBps, setProtocolFeeBps] = useState("250");
  const [treasury, setTreasury] = useState("");
  const [newFeeBps, setNewFeeBps] = useState("500");
  const [newTreasury, setNewTreasury] = useState("");
  const [paused, setPaused] = useState(false);

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

  const initProtocol = useCallback(async () => {
    if (!program) return;
    const fee = parseInt(protocolFeeBps, 10);
    const treasuryPubkey = new PublicKey(treasury || program.provider!.wallet!.publicKey);
    const protocol = protocolPda(PROGRAM_ID);
    return program.methods
      .initializeProtocol(fee, treasuryPubkey)
      .accountsPartial({
        admin: program.provider!.wallet!.publicKey,
        protocol,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  }, [program, protocolFeeBps, treasury]);

  const updateProtocol = useCallback(async () => {
    if (!program) return;
    const protocol = protocolPda(PROGRAM_ID);
    return program.methods
      .updateProtocol(
        newFeeBps ? parseInt(newFeeBps, 10) : null,
        newTreasury ? new PublicKey(newTreasury) : null,
        paused
      )
      .accountsPartial({
        admin: program.provider!.wallet!.publicKey,
        protocol,
      })
      .rpc();
  }, [program, newFeeBps, newTreasury, paused]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Protocol"
      description="Initialize and update global protocol state"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Initialize Protocol</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Fee BPS (e.g. 250)"
            value={protocolFeeBps}
            onChange={(e) => setProtocolFeeBps(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="text"
            placeholder="Treasury (optional)"
            value={treasury}
            onChange={(e) => setTreasury(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm"
          />
          <TxButton
            label="Initialize"
            loading={loading === "init"}
            onClick={() => run("init", initProtocol)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Protocol</label>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            placeholder="New fee BPS"
            value={newFeeBps}
            onChange={(e) => setNewFeeBps(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="text"
            placeholder="New treasury"
            value={newTreasury}
            onChange={(e) => setNewTreasury(e.target.value)}
            className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm"
          />
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={paused}
              onChange={(e) => setPaused(e.target.checked)}
            />
            Paused
          </label>
          <TxButton
            label="Update"
            loading={loading === "update"}
            onClick={() => run("update", updateProtocol)}
          />
        </div>
      </div>
    </InstructionCard>
  );
}
