"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { CustomWalletModalProvider } from "@/components/wallet/CustomWalletModalProvider";
import {
  AlphaWalletAdapter,
  AvanaWalletAdapter,
  BitKeepWalletAdapter,
  BitpieWalletAdapter,
  CloverWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  CoinhubWalletAdapter,
  FractalWalletAdapter,
  HuobiWalletAdapter,
  HyperPayWalletAdapter,
  KeystoneWalletAdapter,
  KrystalWalletAdapter,
  LedgerWalletAdapter,
  MathWalletAdapter,
  NekoWalletAdapter,
  NightlyWalletAdapter,
  NufiWalletAdapter,
  OntoWalletAdapter,
  ParticleAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SaifuWalletAdapter,
  SalmonWalletAdapter,
  SkyWalletAdapter,
  SolflareWalletAdapter,
  SolongWalletAdapter,
  SpotWalletAdapter,
  TokenaryWalletAdapter,
  TokenPocketWalletAdapter,
  TorusWalletAdapter,
  TrezorWalletAdapter,
  TrustWalletAdapter,
  WalletConnectWalletAdapter,
  XDEFIWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useMemo, type ReactNode } from "react";
import { SOLANA_RPC_ENDPOINT } from "@/config/wallet";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => SOLANA_RPC_ENDPOINT, []);

  const wallets = useMemo(
    () => [
      new AlphaWalletAdapter(),
      new AvanaWalletAdapter(),
      new BitKeepWalletAdapter(),
      new BitpieWalletAdapter(),
      new CloverWalletAdapter(),
      new Coin98WalletAdapter(),
      new CoinbaseWalletAdapter(),
      new CoinhubWalletAdapter(),
      new FractalWalletAdapter(),
      new HuobiWalletAdapter(),
      new HyperPayWalletAdapter(),
      new KeystoneWalletAdapter(),
      new KrystalWalletAdapter(),
      new LedgerWalletAdapter(),
      new MathWalletAdapter(),
      new NekoWalletAdapter(),
      new NightlyWalletAdapter(),
      new NufiWalletAdapter(),
      new OntoWalletAdapter(),
      new ParticleAdapter(),
      new PhantomWalletAdapter(),
      new SafePalWalletAdapter(),
      new SaifuWalletAdapter(),
      new SalmonWalletAdapter(),
      new SkyWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolongWalletAdapter(),
      new SpotWalletAdapter(),
      new TokenaryWalletAdapter(),
      new TokenPocketWalletAdapter(),
      new TorusWalletAdapter(),
      new TrezorWalletAdapter(),
      new TrustWalletAdapter(),
      ...(walletConnectProjectId
        ? [
            new WalletConnectWalletAdapter({
              network: WalletAdapterNetwork.Mainnet,
              options: { projectId: walletConnectProjectId },
            }),
          ]
        : []),
      new XDEFIWalletAdapter(),
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
