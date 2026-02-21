import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  GetCommitmentSignature,
  MAGIC_CONTEXT_ID,
  MAGIC_PROGRAM_ID,
} from "@magicblock-labs/ephemeral-rollups-sdk";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import {
  apiKeyPda,
  delegatedUsagePda,
  policyPda,
  protocolPda,
  reputationPda,
  saveTransaction,
  servicePda,
} from "./helpers";

const DELEGATION_PROGRAM_ID = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);
const LOCAL_VALIDATOR_PUBKEY = new PublicKey(
  "mAGicPQYBMvcYveUZA5F5UNNwyHvfYh5xkLS2Fr1mev"
);
const DEVNET_AS_VALIDATOR = new PublicKey(
  "MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57"
);

describe("05_delegation", () => {
  let currentTestName = "";
  beforeEach(function (this: Mocha.Context) {
    currentTestName = this.currentTest?.fullTitle() ?? "unknown";
  });

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const providerEphemeralRollup = new anchor.AnchorProvider(
    new anchor.web3.Connection(
      process.env.PROVIDER_ENDPOINT || "https://devnet-as.magicblock.app/",
      {
        wsEndpoint:
          process.env.WS_ENDPOINT || "wss://devnet-as.magicblock.app/",
      }
    ),
    anchor.Wallet.local()
  );

  console.log("Base Layer Connection:", provider.connection.rpcEndpoint);
  console.log(
    "Ephemeral Rollup Connection:",
    providerEphemeralRollup.connection.rpcEndpoint
  );
  console.log(
    `Current SOL Public Key: ${anchor.Wallet.local().publicKey.toString()}`
  );

  const program =
    anchor.workspace.limitlayerProtocol as Program<LimitlayerProtocol>;
  const protocolPdaKey = protocolPda(program.programId);

  let admin: Keypair;
  let servicePda0: PublicKey;
  let policy0: PublicKey;
  let apiKey0: PublicKey;
  let delegatedUsage0: PublicKey;

  before(async () => {
    admin = provider.wallet.payer as Keypair;
    const balance = await provider.connection.getBalance(admin.publicKey);
    console.log(
      "Current balance is",
      balance / LAMPORTS_PER_SOL,
      " SOL",
      "\n"
    );

    [servicePda0] = servicePda(program.programId, 0);
    const service = await program.account.serviceAccount.fetch(servicePda0);
    policy0 = policyPda(program.programId, servicePda0, service.totalUsageUnits);

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);

    apiKey0 = apiKeyPda(program.programId, protocol.apiKeyCount);
    const reputation0 = reputationPda(program.programId, admin.publicKey);
    await program.methods
      .createApiKey(policy0)
      .accounts({
        authority: admin.publicKey,
        // @ts-expect-error - protocol PDA
        protocol: protocolPdaKey,
        service: servicePda0,
        apiKey: apiKey0,
        delegatedUsage: delegatedUsagePda(program.programId, apiKey0),
        reputation: reputation0,
        owner: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    delegatedUsage0 = delegatedUsagePda(program.programId, apiKey0);
  });

  it("prepare_delegation + delegate_usage on Solana (base layer)", async () => {
    const isLocal =
      providerEphemeralRollup.connection.rpcEndpoint.includes("localhost") ||
      providerEphemeralRollup.connection.rpcEndpoint.includes("127.0.0.1");
    const executionRegion = isLocal
      ? LOCAL_VALIDATOR_PUBKEY
      : DEVNET_AS_VALIDATOR;
    const remainingAccounts = isLocal
      ? [
          {
            pubkey: LOCAL_VALIDATOR_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
        ]
      : [];

    // const start = Date.now();
    const prepareIx = await program.methods
      .prepareDelegation(executionRegion)
      .accountsPartial({
        authority: admin.publicKey,
        service: servicePda0,
        apiKey: apiKey0,
        policy: policy0,
        delegatedUsage: delegatedUsage0,
      })
      .instruction();

    const delegateIx = await program.methods
      .delegateUsage(executionRegion)
      .accountsPartial({
        payer: admin.publicKey,
        apiKey: apiKey0,
        pda: delegatedUsage0,
        ownerProgram: program.programId,
        delegationProgram: DELEGATION_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .remainingAccounts(remainingAccounts)
      .instruction();

    const tx = new anchor.web3.Transaction().add(prepareIx, delegateIx);
    const txHash = await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      tx,
      [admin],
      { skipPreflight: true, commitment: "confirmed" }
    );
    saveTransaction(currentTestName, txHash);
    // const duration = Date.now() - start;
    // console.log(
    //   `${duration}ms (Base Layer) Delegate txHash: ${txHash}`
    // );

    // Delegation CPI transfers ownership to delegation program (we no longer set delegated flag)
    const accInfo = await provider.connection.getAccountInfo(delegatedUsage0);
    expect(accInfo?.owner.toString()).to.equal(
      DELEGATION_PROGRAM_ID.toString()
    );

    await new Promise((resolve) => setTimeout(resolve, 3000));
  });

  it("record_usage_realtime on ER", async () => {
    // const start = Date.now();
    let tx = await program.methods
      .recordUsageRealtime(new anchor.BN(5))
      .accounts({
        delegatedUsage: delegatedUsage0,
        apiKey: apiKey0,
        policy: policy0,
      })
      .transaction();

    // Match anchor-counter: set feePayer, blockhash, sign with ER wallet, send via ER provider
    tx.feePayer = providerEphemeralRollup.wallet.publicKey;
    tx.recentBlockhash = (
      await providerEphemeralRollup.connection.getLatestBlockhash()
    ).blockhash;
    tx = await providerEphemeralRollup.wallet.signTransaction(tx);

    const txHash = await providerEphemeralRollup.sendAndConfirm(tx);
    saveTransaction(currentTestName, txHash);
    // const duration = Date.now() - start;
    // console.log(`${duration}ms (ER) Record usage realtime txHash: ${txHash}`);

    // Fetch from ER connection since account state is on ER before commit
    const programER = new anchor.Program(
      program.idl!,
      providerEphemeralRollup
    ) as Program<LimitlayerProtocol>;
    const delegated =
      await programER.account.delegatedUsageAccount.fetch(delegatedUsage0);
    expect(delegated.currentWindowUsage.toNumber()).to.be.greaterThanOrEqual(5);
  });

  it("submit_usage_checkpoint on ER and confirm on base layer", async () => {
    const start = Date.now();
    let tx = await program.methods
      .submitUsageCheckpoint()
      .accountsPartial({
        payer: providerEphemeralRollup.wallet.publicKey,
        delegatedUsage: delegatedUsage0,
        magicContext: MAGIC_CONTEXT_ID,
        magicProgram: MAGIC_PROGRAM_ID,
      })
      .transaction();

    tx.feePayer = providerEphemeralRollup.wallet.publicKey;
    tx.recentBlockhash = (
      await providerEphemeralRollup.connection.getLatestBlockhash()
    ).blockhash;
    tx = await providerEphemeralRollup.wallet.signTransaction(tx);

    const txHash = await providerEphemeralRollup.sendAndConfirm(tx);
    saveTransaction(currentTestName, txHash);
    const duration = Date.now() - start;
    console.log(
      `${duration}ms (ER) Submit usage checkpoint txHash: ${txHash}`
    );

    const confirmCommitStart = Date.now();
    const txCommitSgn = await GetCommitmentSignature(
      txHash,
      providerEphemeralRollup.connection
    );
    const commitDuration = Date.now() - confirmCommitStart;
    // console.log(
    //   `${commitDuration}ms (Base Layer) Commit signature: ${txCommitSgn}`
    // );
  });

  it("undelegate_usage on ER to Solana", async () => {
    const start = Date.now();
    let tx = await program.methods
      .undelegateUsage()
      .accountsPartial({
        payer: providerEphemeralRollup.wallet.publicKey,
        delegatedUsage: delegatedUsage0,
        magicContext: MAGIC_CONTEXT_ID,
        magicProgram: MAGIC_PROGRAM_ID,
      })
      .transaction();

    tx.feePayer = providerEphemeralRollup.wallet.publicKey;
    tx.recentBlockhash = (
      await providerEphemeralRollup.connection.getLatestBlockhash()
    ).blockhash;
    tx = await providerEphemeralRollup.wallet.signTransaction(tx);

    const txHash = await anchor.web3.sendAndConfirmTransaction(
      providerEphemeralRollup.connection,
      tx,
      [admin],
      { skipPreflight: true, commitment: "confirmed" }
    );
    saveTransaction(currentTestName, txHash);
    const duration = Date.now() - start;
    // console.log(`${duration}ms (ER) Undelegate txHash: ${txHash}`);
  });
});
