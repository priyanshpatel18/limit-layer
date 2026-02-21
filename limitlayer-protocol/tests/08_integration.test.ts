import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { LimitlayerProtocol } from "../target/types/limitlayer_protocol";
import { protocolPda, servicePda } from "./helpers";

describe("08_integration", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.limitlayerProtocol as Program<LimitlayerProtocol>;
  const protocolPdaKey = protocolPda(program.programId);

  it("verifies full protocol + service lifecycle state", async () => {
    const protocol = await program.account.protocolState.fetch(protocolPdaKey);
    expect(protocol.serviceCount.toNumber()).to.be.greaterThanOrEqual(1);

    const [service0] = servicePda(program.programId, 0);
    const service = await program.account.serviceAccount.fetch(service0);
    expect(service.name).to.be.a("string");
    expect(service.bump).to.be.greaterThan(0);
  });
});
