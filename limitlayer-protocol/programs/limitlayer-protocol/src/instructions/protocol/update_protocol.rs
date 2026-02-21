use anchor_lang::prelude::*;

use crate::{
    events::ProtocolUpdated,
    constants::*,
    error::ErrorCode,
    state::ProtocolState,
};

#[derive(Accounts)]
pub struct UpdateProtocol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED.as_bytes()],
        bump = protocol.bump,
        constraint = admin.key() == protocol.admin_authority @ ErrorCode::Unauthorized
    )]
    pub protocol: Account<'info, ProtocolState>,
}

impl<'info> UpdateProtocol<'info> {
    pub fn update_protocol(
        &mut self,
        new_fee_bps: Option<u16>,
        new_treasury: Option<Pubkey>,
        paused: Option<bool>,
    ) -> Result<()> {
        let protocol = &mut self.protocol;

        if let Some(fee) = new_fee_bps {
            require!(fee <= MAX_BPS, ErrorCode::InvalidProtocolFee);
            protocol.protocol_fee_bps = fee;
        }

        if let Some(treasury) = new_treasury {
            require!(treasury != Pubkey::default(), ErrorCode::InvalidInput);
            protocol.treasury = treasury;
        }

        if let Some(p) = paused {
            protocol.paused = p;
        }

        emit!(ProtocolUpdated {
            protocol: self.protocol.key(),
            new_fee_bps,
            new_treasury,
            paused,
        });

        Ok(())
    }
}