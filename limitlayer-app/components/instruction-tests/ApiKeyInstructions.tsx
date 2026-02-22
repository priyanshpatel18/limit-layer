"use client";

import * as anchor from "@coral-xyz/anchor";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLimitLayer } from "@/providers/LimitLayerProvider";
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

export function ApiKeyInstructions() {
  const { program, isReady } = useLimitLayer();
  const [loading, setLoading] = useState<string | null>(null);
  const [serviceIndex, setServiceIndex] = useState("0");
  const [policyAddress, setPolicyAddress] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [apiKeyIndex, setApiKeyIndex] = useState("");
  const [status, setStatus] = useState<"active" | "throttled" | "blocked" | "revoked">(
    "active"
  );

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
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
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
  }, [program, serviceIndex, policyAddress, ownerAddress]);

  const attachPolicy = useCallback(async () => {
    if (!program || !policyAddress) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
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
  }, [program, serviceIndex, policyAddress, apiKeyIndex]);

  const setApiKeyStatus = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
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
  }, [program, serviceIndex, apiKeyIndex, status]);

  const revokeApiKey = useCallback(async () => {
    if (!program) return;
    const [servicePdaKey] = servicePda(PROGRAM_ID, parseInt(serviceIndex, 10));
    const apiKey = apiKeyPda(PROGRAM_ID, parseInt(apiKeyIndex, 10));
    return program.methods
      .revokeApiKey()
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
      title="API Key"
      description="Create, attach policy, set status, revoke API keys"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Create API Key</label>
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
            placeholder="Policy (optional)"
            value={policyAddress}
            onChange={(e) => setPolicyAddress(e.target.value)}
            className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <input
            type="text"
            placeholder="Owner (optional)"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <TxButton
            label="Create"
            loading={loading === "create"}
            onClick={() => run("create", createApiKey)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Attach Policy / Set Status / Revoke</label>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            placeholder="Policy pubkey"
            value={policyAddress}
            onChange={(e) => setPolicyAddress(e.target.value)}
            className="h-9 min-w-[160px] rounded-md border border-input bg-background px-3 text-sm font-mono text-xs"
          />
          <input
            type="number"
            placeholder="API key index"
            value={apiKeyIndex}
            onChange={(e) => setApiKeyIndex(e.target.value)}
            className="h-9 w-24 rounded-md border border-input bg-background px-3 text-sm"
          />
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
