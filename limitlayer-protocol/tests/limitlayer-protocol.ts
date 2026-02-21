import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

const PROGRAM_ID = new PublicKey(
  "LiLyK9amebjWhianExqRjqHMbgdANjEM2MWB9fHT5Q6"
);

describe("limitlayer-protocol", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace
    .limitlayerProtocol as Program<LimitlayerProtocol>;
  const provider = anchor.getProvider();

  const [protocolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("protocol")],
    program.programId
  );

  let admin: Keypair;
  let treasury: Keypair;
  let otherUser: Keypair;

  function servicePda(serviceCount: number): [PublicKey, number] {
    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("service"),
        new anchor.BN(serviceCount).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );
    return [pda, serviceCount];
  }

  before(async () => {
    admin = (provider as anchor.AnchorProvider).wallet.payer as Keypair;
    treasury = Keypair.generate();
    otherUser = Keypair.generate();
    const conn = (provider as anchor.AnchorProvider).connection;
    await conn.requestAirdrop(otherUser.publicKey, 2e9);
    await new Promise((r) => setTimeout(r, 500));
  });

  describe("Protocol suite", () => {
    it("rejects initialize with invalid protocol fee (> 10000 bps)", async () => {
      try {
        await program.methods
          .initializeProtocol(10001, treasury.publicKey)
          .accounts({
            admin: admin.publicKey,
            protocol: protocolPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected InvalidProtocolFee error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6005);
      }
    });

    it("rejects initialize with default/zero treasury pubkey", async () => {
      try {
        await program.methods
          .initializeProtocol(250, PublicKey.default)
          .accounts({
            admin: admin.publicKey,
            protocol: protocolPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected InvalidInput error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6001);
      }
    });

    it("initializes protocol with valid params", async () => {
      const protocolFeeBps = 250; // 2.5%
      const tx = await program.methods
        .initializeProtocol(protocolFeeBps, treasury.publicKey)
        .accounts({
          admin: admin.publicKey,
          protocol: protocolPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      expect(tx).to.be.a("string");

      const protocol = await program.account.protocolState.fetch(protocolPda);
      expect(protocol.adminAuthority.toString()).to.equal(
        admin.publicKey.toString()
      );
      expect(protocol.treasury.toString()).to.equal(
        treasury.publicKey.toString()
      );
      expect(protocol.protocolFeeBps).to.equal(protocolFeeBps);
      expect(protocol.paused).to.equal(false);
      expect(protocol.serviceCount.toNumber()).to.equal(0);
      expect(protocol.apiKeyCount.toNumber()).to.equal(0);
    });

    it("rejects initialize with invalid protocol fee (> 10000 bps)", async () => {
      try {
        await program.methods
          .initializeProtocol(10001, treasury.publicKey)
          .accounts({
            admin: admin.publicKey,
            protocol: protocolPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected InvalidProtocolFee error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6005);
      }
    });

    it("rejects initialize with default/zero treasury pubkey", async () => {
      const [altProtocolPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("protocol")],
        new PublicKey("11111111111111111111111111111111")
      );
      try {
        await program.methods
          .initializeProtocol(250, PublicKey.default)
          .accounts({
            admin: admin.publicKey,
            protocol: protocolPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected InvalidInput error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6001);
      }
    });

    it("updates protocol fee", async () => {
      const newFeeBps = 500;
      await program.methods
        .updateProtocol(newFeeBps, null, null)
        .accounts({
          admin: admin.publicKey,
          protocol: protocolPda,
        })
        .signers([admin])
        .rpc();

      const protocol = await program.account.protocolState.fetch(protocolPda);
      expect(protocol.protocolFeeBps).to.equal(newFeeBps);
    });

    it("updates protocol treasury", async () => {
      const newTreasury = Keypair.generate().publicKey;
      await program.methods
        .updateProtocol(null, newTreasury, null)
        .accounts({
          admin: admin.publicKey,
          protocol: protocolPda,
        })
        .signers([admin])
        .rpc();

      const protocol = await program.account.protocolState.fetch(protocolPda);
      expect(protocol.treasury.toString()).to.equal(newTreasury.toString());
    });

    it("updates protocol paused state", async () => {
      await program.methods
        .updateProtocol(null, null, true)
        .accounts({
          admin: admin.publicKey,
          protocol: protocolPda,
        })
        .signers([admin])
        .rpc();

      let protocol = await program.account.protocolState.fetch(protocolPda);
      expect(protocol.paused).to.equal(true);

      await program.methods
        .updateProtocol(null, null, false)
        .accounts({
          admin: admin.publicKey,
          protocol: protocolPda,
        })
        .signers([admin])
        .rpc();

      protocol = await program.account.protocolState.fetch(protocolPda);
      expect(protocol.paused).to.equal(false);
    });

    it("rejects update_protocol when called by non-admin", async () => {
      try {
        await program.methods
          .updateProtocol(100, null, null)
          .accounts({
            admin: otherUser.publicKey,
            protocol: protocolPda,
          })
          .signers([otherUser])
          .rpc();
        expect.fail("Expected Unauthorized error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6000);
      }
    });

    it("rejects update_protocol with invalid fee", async () => {
      try {
        await program.methods
          .updateProtocol(10001, null, null)
          .accounts({
            admin: admin.publicKey,
            protocol: protocolPda,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected InvalidProtocolFee error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6005);
      }
    });
  });

  describe("Service suite", () => {
    const defaultPolicyPlaceholder = Keypair.generate().publicKey;
    let servicePda0: PublicKey;

    it("creates a service with valid name and default policy", async () => {
      const protocol = await program.account.protocolState.fetch(protocolPda);
      const serviceCount = protocol.serviceCount.toNumber();
      [servicePda0] = servicePda(serviceCount);

      const name = "Test API Service";
      await program.methods
        .createService(name, defaultPolicyPlaceholder)
        .accounts({
          authority: admin.publicKey,
          protocol: protocolPda,
          service: servicePda0,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      const service = await program.account.serviceAccount.fetch(servicePda0);
      expect(service.authority.toString()).to.equal(admin.publicKey.toString());
      expect(service.name).to.equal(name);
      expect(service.status.active !== undefined).to.be.true;
      expect(service.defaultPolicy.toString()).to.equal(
        defaultPolicyPlaceholder.toString()
      );
      expect(service.totalUsageUnits.toNumber()).to.equal(0);
      expect(service.bump).to.be.greaterThan(0);

      const protocolAfter = await program.account.protocolState.fetch(
        protocolPda
      );
      expect(protocolAfter.serviceCount.toNumber()).to.equal(
        protocol.serviceCount.toNumber() + 1
      );
    });

    it("creates a second service (service_count increments)", async () => {
      const protocol = await program.account.protocolState.fetch(protocolPda);
      const serviceCount = protocol.serviceCount.toNumber();
      const [servicePda1] = servicePda(serviceCount);

      const name = "Second Service";
      await program.methods
        .createService(name, defaultPolicyPlaceholder)
        .accounts({
          authority: admin.publicKey,
          protocol: protocolPda,
          service: servicePda1,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([admin])
        .rpc();

      const service = await program.account.serviceAccount.fetch(servicePda1);
      expect(service.name).to.equal(name);
    });

    it("rejects create_service when protocol is paused", async () => {
      await program.methods
        .updateProtocol(null, null, true)
        .accounts({ admin: admin.publicKey, protocol: protocolPda })
        .signers([admin])
        .rpc();

      const protocol = await program.account.protocolState.fetch(protocolPda);
      const serviceCount = protocol.serviceCount.toNumber();
      const [servicePda] = servicePda(serviceCount);

      try {
        await program.methods
          .createService("Blocked Service", defaultPolicyPlaceholder)
          .accounts({
            authority: admin.publicKey,
            protocol: protocolPda,
            service: servicePda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected ProtocolPaused error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6003);
      } finally {
        await program.methods
          .updateProtocol(null, null, false)
          .accounts({ admin: admin.publicKey, protocol: protocolPda })
          .signers([admin])
          .rpc();
      }
    });

    it("rejects create_service with name longer than 64 chars", async () => {
      const protocol = await program.account.protocolState.fetch(protocolPda);
      const serviceCount = protocol.serviceCount.toNumber();
      const [servicePda] = servicePda(serviceCount);

      const longName = "a".repeat(65);
      try {
        await program.methods
          .createService(longName, defaultPolicyPlaceholder)
          .accounts({
            authority: admin.publicKey,
            protocol: protocolPda,
            service: servicePda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([admin])
          .rpc();
        expect.fail("Expected ServiceNameTooLong error");
      } catch (err: unknown) {
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6006);
      }
    });

    it("updates service authority", async () => {
      const newAuthority = otherUser.publicKey;
      await program.methods
        .updateService(newAuthority, null)
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();

      let service = await program.account.serviceAccount.fetch(servicePda0);
      expect(service.authority.toString()).to.equal(newAuthority.toString());

      await program.methods
        .updateService(admin.publicKey, null)
        .accounts({
          authority: otherUser.publicKey,
          service: servicePda0,
        })
        .signers([otherUser])
        .rpc();

      service = await program.account.serviceAccount.fetch(servicePda0);
      expect(service.authority.toString()).to.equal(admin.publicKey.toString());
    });

    it("updates service default policy", async () => {
      const newPolicy = Keypair.generate().publicKey;
      await program.methods
        .updateService(null, newPolicy)
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();

      const service = await program.account.serviceAccount.fetch(servicePda0);
      expect(service.defaultPolicy.toString()).to.equal(newPolicy.toString());
    });

    it("set_service_status: Active -> Paused", async () => {
      await program.methods
        .setServiceStatus({ paused: {} })
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();

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
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6000);
      }
    });

    it("set_service_status: Paused -> Active", async () => {
      await program.methods
        .setServiceStatus({ active: {} })
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();

      const service = await program.account.serviceAccount.fetch(servicePda0);
      expect(service.status.active !== undefined).to.be.true;
    });

    it("set_service_status: Active -> Disabled", async () => {
      await program.methods
        .setServiceStatus({ disabled: {} })
        .accounts({
          authority: admin.publicKey,
          service: servicePda0,
        })
        .signers([admin])
        .rpc();

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
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6008);
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
        const anchorErr = err as { error?: { errorCode?: { code?: number } } };
        expect(anchorErr.error?.errorCode?.code).to.equal(6009);
      }
    });

    it("allows status transition Paused -> Disabled on second service", async () => {
      const [svcPda1] = servicePda(1);
      const svc = await program.account.serviceAccount.fetch(svcPda1);
      if (svc.status.active !== undefined) {
        await program.methods
          .setServiceStatus({ paused: {} })
          .accounts({
            authority: admin.publicKey,
            service: svcPda1,
          })
          .signers([admin])
          .rpc();
      }
      await program.methods
        .setServiceStatus({ disabled: {} })
        .accounts({
          authority: admin.publicKey,
          service: svcPda1,
        })
        .signers([admin])
        .rpc();
      const updated = await program.account.serviceAccount.fetch(svcPda1);
      expect(updated.status.disabled !== undefined).to.be.true;
    });
  });

  describe("Integration: full protocol + service lifecycle", () => {
    it("completes full flow: init -> create services -> update -> status transitions", async () => {
      const protocol = await program.account.protocolState.fetch(protocolPda);
      expect(protocol.serviceCount.toNumber()).to.be.greaterThanOrEqual(1);
      expect(protocol.adminAuthority.toString()).to.equal(
        admin.publicKey.toString()
      );
    });
  });
});
