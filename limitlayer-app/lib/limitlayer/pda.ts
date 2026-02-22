import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey(
  "LLycnqAcLQoVRqQ1jrisJL4oacnkDE6sZnM6MHHxixm"
);

export { PROGRAM_ID };

export function protocolPda(programId: PublicKey = PROGRAM_ID): PublicKey {
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
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(serviceCount));
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("service"), buf],
    programId
  );
  return [pda, serviceCount];
}

export function policyPda(
  programId: PublicKey,
  service: PublicKey,
  totalUsageUnits: BN
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("policy"), service.toBuffer(), totalUsageUnits.toArrayLike(Buffer, "le", 16)],
    programId
  );
  return pda;
}

export function apiKeyPda(
  programId: PublicKey,
  apiKeyCount: BN | number
): PublicKey {
  const bn = typeof apiKeyCount === "number" ? new BN(apiKeyCount) : apiKeyCount;
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("api_key"), bn.toArrayLike(Buffer, "le", 8)],
    programId
  );
  return pda;
}

export function reputationPda(
  programId: PublicKey,
  owner: PublicKey
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("reputation"), owner.toBuffer()],
    programId
  );
  return pda;
}

export function delegatedUsagePda(
  programId: PublicKey,
  apiKey: PublicKey
): PublicKey {
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
