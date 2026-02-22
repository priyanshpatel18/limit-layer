"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  ChevronDownIcon,
  CopyIcon,
  LogOutIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function NavUserMenu() {
  const { setVisible } = useWalletModal();
  const { publicKey, disconnect } = useWallet();

  if (!publicKey) return null;

  const address = publicKey.toBase58();
  const shortAddress = `${address.slice(0, 4)}…${address.slice(-4)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-9 gap-2 pl-1.5 pr-2.5 font-medium bg-primary text-primary-foreground",
            "hover:bg-primary/80 focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <WalletIcon className="size-4 shrink-0 text-primary-foreground" />
          <span className="hidden max-w-[100px] truncate sm:inline">
            {shortAddress}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 text-primary-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            Connected wallet
          </p>
          <p className="truncate font-mono text-sm">{shortAddress}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="hover:text-primary-foreground" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setVisible(true)}>
          <WalletIcon className="hover:text-primary-foreground" />
          Change wallet
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(address);
            toast.success("Address copied");
          }}
        >
          <CopyIcon className="hover:text-primary-foreground" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
        >
          <LogOutIcon className="hover:text-primary-foreground" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
