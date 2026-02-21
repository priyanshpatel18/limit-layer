import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import {
  abuseSignalPda,
  apiKeyPda,
  delegatedUsagePda,
  getErrorCode,
  LAMPORTS_PER_SOL,
  policyPda,
  protocolPda,
  reputationPda,
  saveTransaction,
  servicePda,
} from "./helpers";

function getClockUnixTimestamp(clockData: Buffer): number {
  return Number(clockData.readBigInt64LE(32));
}

describe("07_abuse", () => {
  let currentTestName = "";
  beforeEach(function (this: Mocha.Context) {
    currentTestName = this.currentTest?.fullTitle() ?? "unknown";
  });

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.limitlayerProtocol as Program<LimitlayerProtocol>;
  const provider = anchor.getProvider();
  const protocolPdaKey = protocolPda(program.programId);

  let admin: Keypair;
  let subject: Keypair;
  let severityTestSubject: Keypair;
  let servicePda0: PublicKey;
  let policy0: PublicKey;
  let reputation0: PublicKey;
  let severityTestReputation: PublicKey;

  before(async () => {
    admin = (provider as anchor.AnchorProvider).wallet.payer as Keypair;
    subject = Keypair.generate();
    severityTestSubject = Keypair.generate();
    await (
      provider as anchor.AnchorProvider
    ).sendAndConfirm(
      new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: admin.publicKey,
          toPubkey: subject.publicKey,
          lamports: 0.05 * LAMPORTS_PER_SOL,
        }),
        SystemProgram.transfer({
          fromPubkey: admin.publicKey,
          toPubkey: severityTestSubject.publicKey,
          lamports: 0.05 * LAMPORTS_PER_SOL,
        })
      )
    );

    [servicePda0] = servicePda(program.programId, 0);
    const service = await program.account.serviceAccount.fetch(servicePda0);
    policy0 = policyPda(program.programId, servicePda0, service.totalUsageUnits);
    reputation0 = reputationPda(program.programId, subject.publicKey);
    severityTestReputation = reputationPda(program.programId, severityTestSubject.publicKey);

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const apiKeyPdaKey = apiKeyPda(program.programId, protocol.apiKeyCount);
    await program.methods
      .createApiKey(policy0)
      .accounts({
        authority: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
        service: servicePda0,
        apiKey: apiKeyPdaKey,
        delegatedUsage: delegatedUsagePda(program.programId, apiKeyPdaKey),
        reputation: reputation0,
        owner: subject.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const protocolAfter = await program.account.protocolState.fetch(protocolPdaKey);
    const severityTestApiKey = apiKeyPda(program.programId, protocolAfter.apiKeyCount);
    await program.methods
      .createApiKey(policy0)
      .accounts({
        authority: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
        service: servicePda0,
        apiKey: severityTestApiKey,
        delegatedUsage: delegatedUsagePda(program.programId, severityTestApiKey),
        reputation: severityTestReputation,
        owner: severityTestSubject.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
  });

  it("emit_abuse_signal creates signal and updates reputation", async () => {
    const severity = 5;
    const category = 1; // FLAG_SPAM
    const clockAccount = await program.provider.connection.getAccountInfo(
      anchor.web3.SYSVAR_CLOCK_PUBKEY
    );
    const unixTs = getClockUnixTimestamp(clockAccount!.data!);
    const abuseSignalPdaKey = abuseSignalPda(
      program.programId,
      subject.publicKey,
      unixTs
    );

    const tx = await program.methods
      .emitAbuseSignal(severity, category)
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        // @ts-ignore
        abuseSignal: abuseSignalPdaKey,
        reputation: reputation0,
        clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();
    const sig = await anchor.web3.sendAndConfirmTransaction(
      program.provider.connection,
      tx,
      [admin],
      { skipPreflight: true, commitment: "confirmed" }
    );
    saveTransaction(currentTestName, sig);

    const reputation = await program.account.reputationAccount.fetch(reputation0);
    expect(reputation.signalCount.toString()).to.equal("1");
    expect(reputation.flags).to.equal(category);
  });

  it("rejects emit_abuse_signal with severity > 10", async () => {
    const severity = 11;
    const category = 1;
    const clockAccount = await program.provider.connection.getAccountInfo(
      anchor.web3.SYSVAR_CLOCK_PUBKEY
    );
    const unixTs = getClockUnixTimestamp(clockAccount!.data!);
    const abuseSignalPdaKey = abuseSignalPda(
      program.programId,
      severityTestSubject.publicKey,
      unixTs
    );

    try {
      await program.methods
        .emitAbuseSignal(severity, category)
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
          // @ts-ignore
          abuseSignal: abuseSignalPdaKey,
          reputation: severityTestReputation,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected InvalidSeverity error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6030);
    }
  });

  it("update_reputation applies delta", async () => {
    const delta = 50;
    const sig = await program.methods
      .updateReputation(new anchor.BN(delta))
      .accounts({
        reputation: reputation0,
      })
      .rpc();
    saveTransaction(currentTestName, sig);

    const reputation = await program.account.reputationAccount.fetch(reputation0);
    expect(reputation.globalScore.toNumber()).to.equal(50);
  });

  it("update_reputation clamps to REPUTATION_MAX", async () => {
    const sig = await program.methods
      .updateReputation(new anchor.BN(2_000_000))
      .accounts({
        reputation: reputation0,
      })
      .rpc();
    saveTransaction(currentTestName, sig);

    const reputation = await program.account.reputationAccount.fetch(reputation0);
    expect(reputation.globalScore.toNumber()).to.equal(1_000_000);
  });
});
