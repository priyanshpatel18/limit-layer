import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import {
  apiKeyPda,
  delegatedUsagePda,
  LAMPORTS_PER_SOL,
  policyPda,
  protocolPda,
  reputationPda,
  saveTransaction,
  servicePda,
} from "./helpers";

describe("06_enforcement", () => {
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
  let delegatedUsage0: PublicKey;

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
    delegatedUsage0 = delegatedUsagePda(program.programId, apiKey0);

    const createSig = await program.methods
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
    saveTransaction("06_enforcement before", createSig);
  });

  it("manual_block_key blocks an api key", async () => {
    const sig = await program.methods
      .manualBlockKey()
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
        apiKey: apiKey0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const apiKey = await program.account.apiKeyAccount.fetch(apiKey0);
    expect(apiKey.status.blocked !== undefined).to.be.true;
  });

  it("manual_unblock_key unblocks an api key", async () => {
    const sig = await program.methods
      .manualUnblockKey()
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
});
