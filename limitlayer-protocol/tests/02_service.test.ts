import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import { getErrorCode, LAMPORTS_PER_SOL, protocolPda, saveTransaction, servicePda } from "./helpers";

describe("02_service", () => {
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
  const defaultPolicyPlaceholder = Keypair.generate().publicKey;
  let servicePda0: PublicKey;

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

  it("creates a service with valid name and default policy", async () => {
    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const serviceCount = protocol.serviceCount.toNumber();
    [servicePda0] = servicePda(program.programId, serviceCount);

    const name = "Test API Service";
    const sig = await program.methods
      .createService(name, defaultPolicyPlaceholder)
      .accounts({
        authority: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
        service: servicePda0,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.authority.toString()).to.equal(admin.publicKey.toString());
    expect(service.name).to.equal(name);
    expect(service.status.active !== undefined).to.be.true;
    expect(service.defaultPolicy.toString()).to.equal(defaultPolicyPlaceholder.toString());
    expect(service.totalUsageUnits.toNumber()).to.equal(0);
    expect(service.bump).to.be.greaterThan(0);
  });

  it("creates a second service (service_count increments)", async () => {
    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const serviceCount = protocol.serviceCount.toNumber();
    const [servicePda1] = servicePda(program.programId, serviceCount);

    const name = "Second Service";
    const sig = await program.methods
      .createService(name, defaultPolicyPlaceholder)
      .accounts({
        authority: admin.publicKey,
        // @ts-ignore
        protocol: protocolPdaKey,
        service: servicePda1,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const service = await program.account.serviceAccount.fetch(servicePda1);
    expect(service.name).to.equal(name);
  });

  it("rejects create_service when protocol is paused", async () => {
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

    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const serviceCount = protocol.serviceCount.toNumber();
    const [servicePdaKey] = servicePda(program.programId, serviceCount);

    try {
      await program.methods
        .createService("Blocked Service", defaultPolicyPlaceholder)
        .accounts({
          authority: admin.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
          service: servicePdaKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected ProtocolPaused error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6003);
    } finally {
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
    }
  });

  it("rejects create_service with name longer than 64 chars", async () => {
    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    const serviceCount = protocol.serviceCount.toNumber();
    const [servicePdaKey] = servicePda(program.programId, serviceCount);

    const longName = "a".repeat(65);
    try {
      await program.methods
        .createService(longName, defaultPolicyPlaceholder)
        .accounts({
          authority: admin.publicKey,
          // @ts-ignore
          protocol: protocolPdaKey,
          service: servicePdaKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected ServiceNameTooLong error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6006);
    }
  });

  it("updates service authority", async () => {
    const newAuthority = otherUser.publicKey;
    let sig = await program.methods
      .updateService(newAuthority, null)
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    let service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.authority.toString()).to.equal(newAuthority.toString());

    sig = await program.methods
      .updateService(admin.publicKey, null)
      .accounts({
        authority: otherUser.publicKey,
        service: servicePda0,
      })
      .signers([otherUser])
      .rpc();
    saveTransaction(currentTestName, sig);

    service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.authority.toString()).to.equal(admin.publicKey.toString());
  });

  it("updates service default policy", async () => {
    const newPolicy = Keypair.generate().publicKey;
    const sig = await program.methods
      .updateService(null, newPolicy)
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.defaultPolicy.toString()).to.equal(newPolicy.toString());
  });

  it("set_service_status: Active -> Paused", async () => {
    const sig = await program.methods
      .setServiceStatus({ paused: {} })
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.status.paused !== undefined).to.be.true;
  });

  it("rejects set_service_status when called by non-authority", async () => {
    try {
      await program.methods
        .setServiceStatus({ active: {} })
        .accounts({
          authority: otherUser.publicKey,
          service: servicePda0,
        })
        .signers([otherUser])
        .rpc();
      expect.fail("Expected Unauthorized error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6000);
    }
  });

  it("set_service_status: Paused -> Active", async () => {
    const sig = await program.methods
      .setServiceStatus({ active: {} })
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.status.active !== undefined).to.be.true;
  });

  it("set_service_status: Active -> Disabled", async () => {
    const sig = await program.methods
      .setServiceStatus({ disabled: {} })
      .accounts({
        authority: admin.publicKey,
        service: servicePda0,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);

    const service = await program.account.serviceAccount.fetch(servicePda0);
    expect(service.status.disabled !== undefined).to.be.true;
  });

  it("rejects update_service when service is disabled", async () => {
    try {
      await program.methods
        .updateService(otherUser.publicKey, null)
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected ServiceDisabled error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6008);
    }
  });

  it("rejects set_service_status from Disabled back to Active", async () => {
    try {
      await program.methods
        .setServiceStatus({ active: {} })
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();
      expect.fail("Expected InvalidServiceStatusTransition error");
    } catch (err: unknown) {
      expect(getErrorCode(err)).to.equal(6009);
    }
  });

  it("allows status transition Paused -> Disabled on second service", async () => {
    const [svcPda1] = servicePda(program.programId, 1);
    const svc = await program.account.serviceAccount.fetch(svcPda1);
    if (svc.status.active !== undefined) {
      const sig1 = await program.methods
        .setServiceStatus({ paused: {} })
        .accounts({
          authority: admin.publicKey,
          service: svcPda1,
        })
        .signers([admin])
        .rpc();
      saveTransaction(currentTestName, sig1);
    }
    const sig = await program.methods
      .setServiceStatus({ disabled: {} })
      .accounts({
        authority: admin.publicKey,
        service: svcPda1,
      })
      .signers([admin])
      .rpc();
    saveTransaction(currentTestName, sig);
    const updated = await program.account.serviceAccount.fetch(svcPda1);
    expect(updated.status.disabled !== undefined).to.be.true;
  });
});
