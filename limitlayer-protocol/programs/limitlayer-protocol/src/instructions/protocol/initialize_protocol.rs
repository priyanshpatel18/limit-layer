use anchor_lang::prelude::*;

use crate::{
    events::ProtocolInitialized,
    constants::*,
    error::ErrorCode,
    state::ProtocolState,
};

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + ProtocolState::INIT_SPACE,
        seeds = [PROTOCOL_SEED.as_bytes()],
        bump
    )]
    pub protocol: Account<'info, ProtocolState>,

    pub system_program: Program<'info, System>,
}

impl<'info> InitializeProtocol<'info> {
    pub fn initialize_protocol(
        &mut self,
        protocol_fee_bps: u16,
        treasury: Pubkey,
        bumps: InitializeProtocolBumps,
    ) -> Result<()> {
        require!(protocol_fee_bps <= MAX_BPS, ErrorCode::InvalidProtocolFee);

        // treasury must not be default
        require!(treasury != Pubkey::default(), ErrorCode::InvalidInput);

        self.protocol.set_inner(ProtocolState {
            admin_authority: self.admin.key(),
            treasury,
            protocol_fee_bps,
            paused: false,
            service_count: 0,
            api_key_count: 0,
            total_usage_checkpoints: 0,
            bump: bumps.protocol,
        });

        emit!(ProtocolInitialized {
            protocol: self.protocol.key(),
            admin: self.admin.key(),
            treasury,
            protocol_fee_bps,
        });

        Ok(())
    }
}