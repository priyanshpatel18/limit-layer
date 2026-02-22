import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { LimitlayerProtocol } from "./limitlayer_protocol_types";
import idl from "./idl.json";

export type LimitLayerProgram = Program<LimitlayerProtocol>;

export function createProgram(
  provider: anchor.AnchorProvider
): LimitLayerProgram {
  return new anchor.Program(idl as anchor.Idl, provider) as LimitLayerProgram;
}
