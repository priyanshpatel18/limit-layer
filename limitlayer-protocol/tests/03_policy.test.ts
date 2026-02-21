import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import { getErrorCode, LAMPORTS_PER_SOL, policyPda, protocolPda, saveTransaction, servicePda } from "./helpers";

describe("03_policy", () => {
  let currentTestName = "";
  beforeEach(function (this: Mocha.Context) {
    currentTestName = this.currentTest?.fullTitle() ?? "unknown";
  });

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.limitlayerProtocol as Program<LimitlayerProtocol>;
  const provider = anchor.getProvider();
  const protocolPdaKey = protocolPda(program.programId);

  let admin: Keypair;
  let otherUser: Keypair;
  const defaultPolicyPlaceholder = Keypair.generate().publicKey;
  let servicePda0: PublicKey;
  let policy0: PublicKey;

  before(async () => {
    admin = (provider as anchor.AnchorProvider).wallet.payer as Keypair;
    otherUser = Keypair.generate();
    await (
      provider as anchor.AnchorProvider
    ).sendAndConfirm(
      new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: admin.publicKey,
          toPubkey: otherUser.publicKey,
          lamports: 0.05 * LAMPORTS_PER_SOL,
        })
      )
    );

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const count = protocol.serviceCount.toNumber();
    [servicePda0] = servicePda(program.programId, count > 0 ? 0 : 0);
    const service = await program.account.serviceAccount.fetch(servicePda0);
    policy0 = policyPda(program.programId, servicePda0, service.totalUsageUnits);
  });

  it("creates a policy with valid params", async () => {
    const requestsPerWindow = 100;
    const windowSeconds = 60;
    const burstLimit = 20;
    const costPerRequest = 1000;

    const sig = await program.methods
      .createPolicy(
        new anchor.BN(requestsPerWindow),
        new anchor.BN(windowSeconds),
        new anchor.BN(burstLimit),
        new anchor.BN(costPerRequest)
      )
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        // @ts-ignore
        policy: policy0,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const policy = await program.account.rateLimitPolicy.fetch(policy0);
    expect(policy.service.toString()).to.equal(servicePda0.toString());
    expect(policy.requestsPerWindow.toNumber()).to.equal(requestsPerWindow);
    expect(policy.windowSeconds.toNumber()).to.equal(windowSeconds);
    expect(policy.burstLimit.toNumber()).to.equal(burstLimit);
    expect(policy.costPerRequest.toNumber()).to.equal(costPerRequest);
  });

  it("rejects create_policy with invalid config (burst > requests_per_window)", async () => {
    const [svcPda] = servicePda(program.programId, 1);
    const svc = await program.account.serviceAccount.fetch(svcPda);
    const policyKey = policyPda(program.programId, svcPda, svc.totalUsageUnits);

    try {
      await program.methods
        .createPolicy(new anchor.BN(10), new anchor.BN(60), new anchor.BN(20), new anchor.BN(0))
        .accounts({
          authority: admin.publicKey,
          service: svcPda,
          // @ts-ignore
          policy: policyKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected InvalidRateLimitConfig error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6012);
    }
  });

  it("rejects create_policy when called by non-authority", async () => {
    const [svcPda] = servicePda(program.programId, 1);
    const svc = await program.account.serviceAccount.fetch(svcPda);
    const policyKey = policyPda(program.programId, svcPda, svc.totalUsageUnits);

    try {
      await program.methods
        .createPolicy(new anchor.BN(100), new anchor.BN(60), new anchor.BN(20), new anchor.BN(0))
        .accounts({
          authority: otherUser.publicKey,
          service: svcPda,
          // @ts-ignore
          policy: policyKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([otherUser])
        .rpc();
      expect.fail("Expected Unauthorized error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6000);
    }
  });

  it("updates policy", async () => {
    const newRequestsPerWindow = 200;
    const newWindowSeconds = 120;

    const sig = await program.methods
      .updatePolicy(
        new anchor.BN(newRequestsPerWindow),
        new anchor.BN(newWindowSeconds),
        null,
        null
      )
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        policy: policy0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const policy = await program.account.rateLimitPolicy.fetch(policy0);
    expect(policy.requestsPerWindow.toNumber()).to.equal(newRequestsPerWindow);
    expect(policy.windowSeconds.toNumber()).to.equal(newWindowSeconds);
  });
});
