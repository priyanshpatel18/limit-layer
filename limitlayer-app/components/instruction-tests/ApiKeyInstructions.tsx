"use client";

import * as anchor from "@coral-xyz/anchor";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
import { useUserServices } from "@/hooks/useUserServices";
import { useProtocol } from "@/hooks/useProtocol";
import { useApiKey } from "@/hooks/useApiKey";
import { BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  apiKeyPda,
  delegatedUsagePda,
  policyPda,
  protocolPda,
  reputationPda,
  servicePda,
  PROGRAM_ID,
} from "@/lib/limitlayer/pda";
import { InstructionCard, TxButton } from "./InstructionCard";

function getApiKeyStatusRaw(apiKey: { status: unknown } | null): string {
  if (!apiKey?.status) return "";
  const raw = apiKey.status && typeof apiKey.status === "object"
    ? Object.keys(apiKey.status as object)[0] ?? ""
    : String(apiKey.status);
  return raw.toLowerCase();
}

export function ApiKeyInstructions() {
  const { program, isReady } = useLimitLayer();
  const { data: userServices = [] } = useUserServices();
  const { data: protocol } = useProtocol();
  const [apiKeyIndex, setApiKeyIndex] = useState("");
  const { data: selectedApiKey } = useApiKey(apiKeyIndex);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedServiceIndex, setSelectedServiceIndex] = useState("0");
  const [policyAddress, setPolicyAddress] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [status, setStatus] = useState<"active" | "throttled" | "blocked" | "revoked">(
    "active"
  );

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

  const createApiKey = useCallback(async () => {
    if (!program) return;
    const protocol = await program.account.protocolState.fetch(
      protocolPda(PROGRAM_ID)
    );
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
    const service = await program.account.serviceAccount.fetch(servicePdaKey);
    const policyKey = policyAddress
      ? new PublicKey(policyAddress)
      : policyPda(PROGRAM_ID, servicePdaKey, new BN(0));
    const apiKey = apiKeyPda(PROGRAM_ID, protocol.apiKeyCount);
    const owner = ownerAddress
      ? new PublicKey(ownerAddress)
      : program.provider!.wallet!.publicKey;
    const reputation = reputationPda(PROGRAM_ID, owner);
    return program.methods
      .createApiKey(policyKey)
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        protocol: protocolPda(PROGRAM_ID),
        service: servicePdaKey,
        apiKey,
        delegatedUsage: delegatedUsagePda(PROGRAM_ID, apiKey),
        reputation,
        owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();
  }, [program, selectedServiceIndex, policyAddress, ownerAddress]);

  const attachPolicy = useCallback(async () => {
    if (!program || !policyAddress) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
    const policy = new PublicKey(policyAddress);
    const protocol = await program.account.protocolState.fetch(
      protocolPda(PROGRAM_ID)
    );
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .attachPolicyToKey()
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        policy,
        apiKey,
      })
      .rpc();
  }, [program, selectedServiceIndex, policyAddress, apiKeyIndex]);

  const setApiKeyStatus = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    const statusVal =
      status === "active"
        ? { active: {} }
        : status === "throttled"
          ? { throttled: {} }
          : status === "blocked"
            ? { blocked: {} }
            : { revoked: {} };
    return program.methods
      .setApiKeyStatus(statusVal)
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        apiKey,
      })
      .rpc();
  }, [program, selectedServiceIndex, apiKeyIndex, status]);

  const revokeApiKey = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(selectedServiceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .revokeApiKey()
      .accountsPartial({
        authority: program.provider!.wallet!.publicKey,
        service: servicePdaKey,
        apiKey,
      })
      .rpc();
  }, [program, selectedServiceIndex, apiKeyIndex]);

  const isProtocolPaused = protocol?.paused === true;
  const apiKeyStatus = getApiKeyStatusRaw(selectedApiKey ?? null);
  const isApiKeyRevoked = apiKeyStatus === "revoked";
  const canCreateApiKey = !isProtocolPaused;
  const canSetApiKeyStatus = !isApiKeyRevoked;
  const canRevokeApiKey = !isApiKeyRevoked;

  if (!isReady) return null;

  return (
    <InstructionCard
      title="API Key"
      description="Create, attach policy, set status, revoke API keys"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Create API Key</label>
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
            <label className="text-xs font-medium text-muted-foreground">Policy (optional)</label>
            <input
              type="text"
              placeholder="Policy pubkey"
              value={policyAddress}
              onChange={(e) => setPolicyAddress(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Owner (optional)</label>
            <input
              type="text"
              placeholder="Owner pubkey"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <TxButton
            label="Create"
            loading={loading === "create"}
            onClick={() => run("create", createApiKey)}
            disabled={!canCreateApiKey}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Attach Policy / Set Status / Revoke</label>
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
            <label className="text-xs font-medium text-muted-foreground">Policy pubkey</label>
            <input
              type="text"
              placeholder="Policy pubkey"
              value={policyAddress}
              onChange={(e) => setPolicyAddress(e.target.value)}
              className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">API key index</label>
            <input
              type="number"
              placeholder="0"
              value={apiKeyIndex}
              onChange={(e) => setApiKeyIndex(e.target.value)}
              className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "active" | "throttled" | "blocked" | "revoked"
                )
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="active">Active</option>
              <option value="throttled">Throttled</option>
              <option value="blocked">Blocked</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <TxButton
            label="Attach Policy"
            loading={loading === "attach"}
            onClick={() => run("attach", attachPolicy)}
          />
          <TxButton
            label="Set Status"
            loading={loading === "status"}
            onClick={() => run("status", setApiKeyStatus)}
          />
          <TxButton
            label="Revoke"
            variant="outline"
            loading={loading === "revoke"}
            onClick={() => run("revoke", revokeApiKey)}
          />
        </div>
      </div>
    </InstructionCard>
  );
}
