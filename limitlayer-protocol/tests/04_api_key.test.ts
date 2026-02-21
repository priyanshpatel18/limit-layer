import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import {
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

describe("04_api_key", () => {
  let currentTestName = "";
  beforeEach(function (this: Mocha.Context) {
    currentTestName = this.currentTest?.fullTitle() ?? "unknown";
  });

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.limitlayerProtocol as Program<LimitlayerProtocol>;
  const provider = anchor.getProvider();
  const protocolPdaKey = protocolPda(program.programId);

  let admin: Keypair;
  let owner: Keypair;
  let otherUser: Keypair;
  let servicePda0: PublicKey;
  let policy0: PublicKey;
  let apiKey0: PublicKey;
  let reputation0: PublicKey;

  before(async () => {
    admin = (provider as anchor.AnchorProvider).wallet.payer as Keypair;
    owner = Keypair.generate();
    otherUser = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: owner.publicKey,
        lamports: 0.05 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: otherUser.publicKey,
        lamports: 0.05 * LAMPORTS_PER_SOL,
      })
    );
    await (provider as anchor.AnchorProvider).sendAndConfirm(tx);

    [servicePda0] = servicePda(program.programId, 0);
    const service = await program.account.serviceAccount.fetch(servicePda0);
    policy0 = policyPda(program.programId, servicePda0, service.totalUsageUnits);

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    apiKey0 = apiKeyPda(program.programId, protocol.apiKeyCount);
    reputation0 = reputationPda(program.programId, owner.publicKey);
  });

  it("creates an api key with policy", async () => {
    const sig = await program.methods
      .createApiKey(policy0)
      .accounts({
        authority: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
        service: servicePda0,
        apiKey: apiKey0,
        delegatedUsage: delegatedUsagePda(program.programId, apiKey0),
        reputation: reputation0,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const apiKey = await program.account.apiKeyAccount.fetch(apiKey0);
    expect(apiKey.service.toString()).to.equal(servicePda0.toString());
    expect(apiKey.owner.toString()).to.equal(owner.publicKey.toString());
    expect(apiKey.policy.toString()).to.equal(policy0.toString());
    expect(apiKey.status.active !== undefined).to.be.true;
    expect(apiKey.lifetimeUsage.toNumber()).to.equal(0);
  });

  it("rejects create_api_key when called by non-authority", async () => {
    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const nextApiKeyPda = apiKeyPda(program.programId, protocol.apiKeyCount);
    const repPda = reputationPda(program.programId, otherUser.publicKey);

    try {
      await program.methods
        .createApiKey(policy0)
        .accounts({
          authority: otherUser.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
          service: servicePda0,
          apiKey: nextApiKeyPda,
          delegatedUsage: delegatedUsagePda(program.programId, nextApiKeyPda),
          reputation: repPda,
          owner: otherUser.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([otherUser])
        .rpc();
      expect.fail("Expected Unauthorized error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6000);
    }
  });

  it("attach_policy_to_key", async () => {
    const sig = await program.methods
      .attachPolicyToKey()
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        policy: policy0,
        apiKey: apiKey0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const updated = await program.account.apiKeyAccount.fetch(apiKey0);
    expect(updated.policy.toString()).to.equal(policy0.toString());
  });

  it("set_api_key_status: Active -> Throttled", async () => {
    const sig = await program.methods
      .setApiKeyStatus({ throttled: {} })
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        apiKey: apiKey0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const apiKey = await program.account.apiKeyAccount.fetch(apiKey0);
    expect(apiKey.status.throttled !== undefined).to.be.true;
  });

  it("set_api_key_status: Throttled -> Active", async () => {
    const sig = await program.methods
      .setApiKeyStatus({ active: {} })
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        apiKey: apiKey0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const apiKey = await program.account.apiKeyAccount.fetch(apiKey0);
    expect(apiKey.status.active !== undefined).to.be.true;
  });

  it("revoke_api_key", async () => {
    const sig = await program.methods
      .revokeApiKey()
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        apiKey: apiKey0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const apiKey = await program.account.apiKeyAccount.fetch(apiKey0);
    expect(apiKey.status.revoked !== undefined).to.be.true;
  });
});
