"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import {
  ProtocolInstructions,
  ServiceInstructions,
  PolicyInstructions,
  ApiKeyInstructions,
  EnforcementInstructions,
  AbuseReputationInstructions,
} from "@/components/instruction-tests";
import { Nav } from "@/components/Nav";
import { cn } from "@/lib/utils";
import { useProtocol } from "@/hooks";

export default function DevelopPage() {
  const { connected, publicKey } = useWallet();
  const { data: protocol } = useProtocol();
  const isProtocolAdmin =
    connected &&
    publicKey &&
    protocol &&
    protocol.adminAuthority.equals(publicKey);

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Instruction Testing
          </h1>
          <p className="text-sm text-muted-foreground">
            Test protocol instructions with real-time wallet integration
          </p>
        </div>

        {!connected ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-20"
            )}
          >
            <p className="mb-4 text-muted-foreground">
              Connect your wallet to test protocol instructions
            </p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-8">
            {isProtocolAdmin && (
              <section>
                <h2 className="mb-4 text-lg font-semibold text-foreground">
                  Protocol Instructions
                </h2>
                <ProtocolInstructions />
              </section>
            )}

            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Service Instructions
              </h2>
              <ServiceInstructions />
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Policy Instructions
              </h2>
              <PolicyInstructions />
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                API Key Instructions
              </h2>
              <ApiKeyInstructions />
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Enforcement Instructions
              </h2>
              <EnforcementInstructions />
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Abuse & Reputation
              </h2>
              <AbuseReputationInstructions />
            </section>

            <p className="pt-8 text-center text-sm text-muted-foreground">
              Uses Devnet. Ensure the protocol is deployed and your wallet has
              SOL.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
