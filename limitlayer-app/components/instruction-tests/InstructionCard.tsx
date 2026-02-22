"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type InstructionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function InstructionCard({
  title,
  description,
  children,
  className,
}: InstructionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

type TxButtonProps = {
  label: string;
  onClick: () => Promise<void>;
  disabled?: boolean;
  variant?: "default" | "outline" | "destructive";
  loading?: boolean;
};

export function TxButton({
  label,
  onClick,
  disabled,
  variant = "default",
  loading,
}: TxButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "..." : label}
    </Button>
  );
}
