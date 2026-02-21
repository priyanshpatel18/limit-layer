import * as anchor from "@coral-xyz/anchor";
import { AnchorError } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

const TX_LOG_PATH = path.join(process.cwd(), "test-transactions.jsonl");

export function saveTransaction(iterationName: string, signature: string): void {
  const line = JSON.stringify({
    iteration: iterationName,
    signature,
  }) + "\n";
  fs.appendFileSync(TX_LOG_PATH, line);
}

/** Extract numeric error code from AnchorError or ProgramError. */
export function getErrorCode(err: unknown): number | undefined {
  if (err instanceof AnchorError) {
    return err.error.errorCode.number;
  }
  const e = err as { code?: number; error?: { errorCode?: { number?: number } } };
  return e?.error?.errorCode?.number ?? e?.code;
}

export const LAMPORTS_PER_SOL = 1e9;
export const TEST_SOL = 0.05 * LAMPORTS_PER_SOL;

export function protocolPda(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("protocol")],
    programId
  );
  return pda;
}

export function servicePda(
  programId: PublicKey,
  serviceCount: number
): [PublicKey, number] {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("service"), new anchor.BN(serviceCount).toArrayLike(Buffer, "le", 8)],
    programId
  );
  return [pda, serviceCount];
}

export function policyPda(
  programId: PublicKey,
  service: PublicKey,
  totalUsageUnits: anchor.BN
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("policy"), service.toBuffer(), totalUsageUnits.toArrayLike(Buffer, "le", 16)],
    programId
  );
  return pda;
}

export function apiKeyPda(programId: PublicKey, apiKeyCount: anchor.BN): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("api_key"), apiKeyCount.toArrayLike(Buffer, "le", 8)],
    programId
  );
  return pda;
}

export function reputationPda(programId: PublicKey, owner: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("reputation"), owner.toBuffer()],
    programId
  );
  return pda;
}

export function delegatedUsagePda(programId: PublicKey, apiKey: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegated_usage"), apiKey.toBuffer()],
    programId
  );
  return pda;
}

export function abuseSignalPda(
  programId: PublicKey,
  subject: PublicKey,
  unixTimestamp: number
): PublicKey {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(BigInt(unixTimestamp));
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("abuse_signal"), subject.toBuffer(), buf],
    programId
  );
  return pda;
}
