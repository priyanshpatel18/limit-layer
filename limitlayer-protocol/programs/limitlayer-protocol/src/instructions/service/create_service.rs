use anchor_lang::prelude::*;

use crate::{
    constants::{*, MAX_NAME_LEN},
    enums::ServiceStatus,
    error::ErrorCode,
    events::ServiceCreated,
    state::{ProtocolState, ServiceAccount},
};

#[derive(Accounts)]
pub struct CreateService<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED.as_bytes()],
        bump = protocol.bump,
        constraint = !protocol.paused @ ErrorCode::ProtocolPaused
    )]
    pub protocol: Account<'info, ProtocolState>,

    #[account(
        init,
        payer = authority,
        space = 8 + ServiceAccount::INIT_SPACE,
        seeds = [
            SERVICE_SEED.as_bytes(),
            protocol.service_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub service: Account<'info, ServiceAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateService<'info> {
    pub fn create_service(
        &mut self,
        name: String,
        default_policy: Pubkey,
        bumps: CreateServiceBumps,
    ) -> Result<()> {
        require!(name.len() <= MAX_NAME_LEN as usize, ErrorCode::ServiceNameTooLong);
        
        let protocol = &mut self.protocol;

        protocol.service_count = protocol
            .service_count
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;

        self.service.set_inner(ServiceAccount {
            authority: self.authority.key(),
            name: name.clone(),
            status: ServiceStatus::Active,
            default_policy,
            total_usage_units: 0,
            created_ts: Clock::get()?.unix_timestamp,
            bump: bumps.service,
        });

        emit!(ServiceCreated {
            service: self.service.key(),
            protocol: self.protocol.key(),
            authority: self.authority.key(),
            name,
            default_policy,
        });

        Ok(())
    }
}