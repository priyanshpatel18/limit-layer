"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { CustomWalletModalProvider } from "@/components/wallet/CustomWalletModalProvider";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  TorusWalletAdapter,
  WalletConnectWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo, type ReactNode } from "react";
import { SOLANA_RPC_ENDPOINT } from "@/config/wallet";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC_ENDPOINT, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new LedgerWalletAdapter(),
      new TorusWalletAdapter(),
      ...(walletConnectProjectId
        ? [
            new WalletConnectWalletAdapter({
              network: WalletAdapterNetwork.Mainnet,
              options: { projectId: walletConnectProjectId },
            }),
          ]
        : []),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <CustomWalletModalProvider>{children}</CustomWalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
