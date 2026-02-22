"use client";

import * as anchor from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import { useUserServices } from "@/hooks/useUserServices";
import { useProtocol } from "@/hooks/useProtocol";
import {
  protocolPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

type ServiceStatus = "active" | "paused" | "disabled";

export function ServiceInstructions() {
  const { program, isReady } = useLimitLayer();
  const { data: userServices = [] } = useUserServices();
  const { data: protocol } = useProtocol();
  const [loading, setLoading] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("Test API Service");
  const [defaultPolicy, setDefaultPolicy] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState<string>("0");
  const [status, setStatus] = useState<ServiceStatus>("active");

  useEffect(() => {
    if (userServices.length > 0 && !userServices.some((s) => s.index.toString() === selectedServiceIndex)) {
      setSelectedServiceIndex(userServices[0].index.toString());
    }
  }, [userServices, selectedServiceIndex]);

  useEffect(() => {
    const svc = userServices.find((s) => s.index.toString() === selectedServiceIndex);
    if (svc?.status?.toLowerCase() === "disabled") {
      setStatus("disabled");
    }
  }, [userServices, selectedServiceIndex]);

  const selectedService = userServices.find((s) => s.index.toString() === selectedServiceIndex);
  const isServiceDisabled = selectedService?.status?.toLowerCase() === "disabled";
  const isProtocolPaused = protocol?.paused === true;
  const canCreateService = !isProtocolPaused;
  const canSetStatus = !isServiceDisabled;
  const canUpdateService = !isServiceDisabled;

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
    const idx = parseInt(selectedServiceIndex, 10);
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
  }, [program, selectedServiceIndex, newAuthority]);

  const setServiceStatus = useCallback(async () => {
    if (!program) return;
    const idx = parseInt(selectedServiceIndex, 10);
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
  }, [program, selectedServiceIndex, status]);

  if (!isReady) return null;

  return (
    <InstructionCard
      title="Service"
      description="Create and manage API provider services"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Create Service</label>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Service name</label>
            <input
              type="text"
              placeholder="e.g. My API"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Default policy (optional)</label>
            <input
              type="text"
              placeholder="Pubkey"
              value={defaultPolicy}
              onChange={(e) => setDefaultPolicy(e.target.value)}
              className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <TxButton
            label="Create"
            loading={loading === "create"}
            onClick={() => run("create", createService)}
            disabled={!canCreateService}
          />
        </div>
        {isProtocolPaused && (
          <p className="text-xs text-muted-foreground">
            Protocol is paused. Create Service is unavailable until protocol is resumed.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Update Service & Set Status</label>
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
            <label className="text-xs font-medium text-muted-foreground">New authority (optional)</label>
            <input
              type="text"
              placeholder="Pubkey"
              value={newAuthority}
              onChange={(e) => setNewAuthority(e.target.value)}
              className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ServiceStatus)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="active" disabled={isServiceDisabled}>Active</option>
              <option value="paused" disabled={isServiceDisabled}>Paused</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <TxButton
            label="Update"
            loading={loading === "update"}
            onClick={() => run("update", updateService)}
            disabled={!canUpdateService}
          />
          <TxButton
            label="Set Status"
            loading={loading === "status"}
            onClick={() => run("status", setServiceStatus)}
            disabled={!canSetStatus}
          />
        </div>
        {isServiceDisabled && (
          <p className="text-xs text-muted-foreground">
            Disabled services cannot be updated or re-enabled. Update and Set Status are unavailable.
          </p>
        )}
      </div>
    </InstructionCard>
  );
}
