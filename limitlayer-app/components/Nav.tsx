"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { WalletConnectButton } from "./wallet/WalletConnectButton";
import { NavUserMenu } from "./NavUserMenu";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/develop", label: "DEVELOP" },
];

export function Nav() {
  const pathname = usePathname();
  const { connected } = useWallet();

  return (
    <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex min-w-0">
        <Logo />
      </div>
      <nav className="hidden justify-center gap-6 sm:flex">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors hover:text-foreground ${
              pathname === href ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex min-w-0 justify-end">
        {connected ? <NavUserMenu /> : <WalletConnectButton />}
      </div>
    </header>
  );
}
