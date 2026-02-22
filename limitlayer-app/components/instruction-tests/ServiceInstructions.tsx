"use client";

import * as anchor from "@coral-xyz/anchor";
import { useCallback, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import {
  protocolPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

export function ServiceInstructions() {
  const { program, isReady } = useLimitLayer();
  const [loading, setLoading] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("Test API Service");
  const [defaultPolicy, setDefaultPolicy] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [serviceIndex, setServiceIndex] = useState("0");
  const [status, setStatus] = useState<"active" | "paused" | "disabled">("active");

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

  const createService = useCallback(async () => {
    if (!program) return;
    const protocol = await program.account.protocolState.fetch(
      protocolPda(PROGRAM_ID)
    );
    const [service] = servicePda(PROGRAM_ID, protocol.serviceCount.toNumber());
    const defPolicy = defaultPolicy
      ? new PublicKey(defaultPolicy)
      : PublicKey.default;
    return program.methods
      .createService(serviceName, defPolicy)
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        protocol: protocolPda(PROGRAM_ID),
        service,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  }, [program, serviceName, defaultPolicy]);

  const updateService = useCallback(async () => {
    if (!program) return;
    const idx = parseInt(serviceIndex, 10);
    const [service] = servicePda(PROGRAM_ID, idx);
    return program.methods
      .updateService(
        newAuthority ? new PublicKey(newAuthority) : null,
        null
      )
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service,
      })
      .rpc();
  }, [program, serviceIndex, newAuthority]);

  const setServiceStatus = useCallback(async () => {
    if (!program) return;
    const idx = parseInt(serviceIndex, 10);
    const [service] = servicePda(PROGRAM_ID, idx);
    const statusVal =
      status === "active"
        ? { active: {} }
        : status === "paused"
          ? { paused: {} }
          : { disabled: {} };
    return program.methods
      .setServiceStatus(statusVal)
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service,
      })
      .rpc();
  }, [program, serviceIndex, status]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Service"
      description="Create and manage API provider services"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Create Service</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Service name"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="text"
            placeholder="Default policy (optional)"
            value={defaultPolicy}
            onChange={(e) => setDefaultPolicy(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <TxButton
            label="Create"
            loading={loading === "create"}
            onClick={() => run("create", createService)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Service</label>
        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            placeholder="Service index"
            value={serviceIndex}
            onChange={(e) => setServiceIndex(e.target.value)}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="text"
            placeholder="New authority"
            value={newAuthority}
            onChange={(e) => setNewAuthority(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <TxButton
            label="Update"
            loading={loading === "update"}
            onClick={() => run("update", updateService)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Set Service Status</label>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            placeholder="Service index"
            value={serviceIndex}
            onChange={(e) => setServiceIndex(e.target.value)}
            className="h-9 w-28 rounded-md border border-input bg-background px-3 text-sm"
          />
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "active" | "paused" | "disabled")
            }
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="disabled">Disabled</option>
          </select>
          <TxButton
            label="Set Status"
            loading={loading === "status"}
            onClick={() => run("status", setServiceStatus)}
          />
        </div>
      </div>
    </InstructionCard>
  );
}
