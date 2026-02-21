import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import { getErrorCode, LAMPORTS_PER_SOL, protocolPda, saveTransaction } from "./helpers";

describe("01_protocol", () => {
  let currentTestName = "";
  beforeEach(function (this: Mocha.Context) {
    currentTestName = this.currentTest?.fullTitle() ?? "unknown";
  });

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.limitlayerProtocol as Program<LimitlayerProtocol>;
  const provider = anchor.getProvider();
  const protocolPdaKey = protocolPda(program.programId);

  let admin: Keypair;
  let treasury: Keypair;
  let otherUser: Keypair;

  before(async () => {
    admin = (provider as anchor.AnchorProvider).wallet.payer as Keypair;
    treasury = Keypair.generate();
    otherUser = Keypair.generate();
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: otherUser.publicKey,
        lamports: 0.05 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: treasury.publicKey,
        lamports: 0.05 * LAMPORTS_PER_SOL,
      })
    );
    await (provider as anchor.AnchorProvider).sendAndConfirm(tx);
  });

  it("rejects initialize with invalid protocol fee (> 10000 bps)", async () => {
    try {
      await program.methods
        .initializeProtocol(10001, treasury.publicKey)
        .accounts({
          admin: admin.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected InvalidProtocolFee error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6005);
    }
  });

  it("rejects initialize with default/zero treasury pubkey", async () => {
    try {
      await program.methods
        .initializeProtocol(250, PublicKey.default)
        .accounts({
          admin: admin.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected InvalidInput error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6001);
    }
  });

  it("initializes protocol with valid params", async () => {
    const protocolFeeBps = 250;
    const sig = await program.methods
      .initializeProtocol(protocolFeeBps, treasury.publicKey)
      .accounts({
        admin: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    expect(sig).to.be.a("string");

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    expect(protocol.adminAuthority.toString()).to.equal(admin.publicKey.toString());
    expect(protocol.treasury.toString()).to.equal(treasury.publicKey.toString());
    expect(protocol.protocolFeeBps).to.equal(protocolFeeBps);
    expect(protocol.paused).to.equal(false);
    expect(protocol.serviceCount.toNumber()).to.equal(0);
    expect(protocol.apiKeyCount.toNumber()).to.equal(0);
  });

  it("updates protocol fee", async () => {
    const newFeeBps = 500;
    const sig = await program.methods
      .updateProtocol(newFeeBps, null, null)
      .accounts({
        admin: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    expect(protocol.protocolFeeBps).to.equal(newFeeBps);
  });

  it("updates protocol treasury", async () => {
    const newTreasury = Keypair.generate().publicKey;
    const sig = await program.methods
      .updateProtocol(null, newTreasury, null)
      .accounts({
        admin: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    expect(protocol.treasury.toString()).to.equal(newTreasury.toString());
  });

  it("updates protocol paused state", async () => {
    let sig = await program.methods
      .updateProtocol(null, null, true)
      .accounts({
        admin: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    let protocol = await program.account.protocolState.fetch(protocolPdaKey);
    expect(protocol.paused).to.equal(true);

    sig = await program.methods
      .updateProtocol(null, null, false)
      .accounts({
        admin: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    protocol = await program.account.protocolState.fetch(protocolPdaKey);
    expect(protocol.paused).to.equal(false);
  });

  it("rejects update_protocol when called by non-admin", async () => {
    try {
      await program.methods
        .updateProtocol(100, null, null)
        .accounts({
          admin: otherUser.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
        })
        .signers([otherUser])
        .rpc();
      expect.fail("Expected Unauthorized error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6000);
    }
  });

  it("rejects update_protocol with invalid fee", async () => {
    try {
      await program.methods
        .updateProtocol(10001, null, null)
        .accounts({
          admin: admin.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected InvalidProtocolFee error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6005);
    }
  });
});
