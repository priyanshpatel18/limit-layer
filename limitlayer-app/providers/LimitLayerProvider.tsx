"use client";

import * as anchor from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createProgram, type LimitLayerProgram } from "@/lib/limitlayer/program";

type LimitLayerContextValue = {
  program: LimitLayerProgram | null;
  provider: anchor.AnchorProvider | null;
  isReady: boolean;
};

const LimitLayerContext = createContext<LimitLayerContextValue>({
  program: null,
  provider: null,
  isReady: false,
});

export function LimitLayerProvider({ children }: { children: ReactNode }) {
  const { connection } = useConnection();
  const wallet = useWallet();

  const value = useMemo<LimitLayerContextValue>(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return { program: null, provider: null, isReady: false };
    }

    const walletAdapter = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction.bind(wallet),
      signAllTransactions: wallet.signAllTransactions.bind(wallet),
    };

    const provider = new anchor.AnchorProvider(
      connection,
      walletAdapter as anchor.Wallet,
      { commitment: "confirmed", preflightCommitment: "confirmed" }
    );

    const program = createProgram(provider);

    return {
      program,
      provider,
      isReady: true,
    };
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

  return (
    <LimitLayerContext.Provider value={value}>
      {children}
    </LimitLayerContext.Provider>
  );
}

export function useLimitLayer() {
  const ctx = useContext(LimitLayerContext);
  if (!ctx) {
    throw new Error("useLimitLayer must be used within LimitLayerProvider");
  }
  return ctx;
}
