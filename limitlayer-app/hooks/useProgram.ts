"use client";

import { useLimitLayer } from "@/providers/LimitLayerProvider";
import type { LimitLayerProgram } from "@/lib/limitlayer/program";

export function useProgram(): LimitLayerProgram | null {
  const { program } = useLimitLayer();
  return program;
}
