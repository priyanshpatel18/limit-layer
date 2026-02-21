use anchor_lang::prelude::*;

use crate::{
    error::ErrorCode,
    events::ServiceUpdated,
    state::ServiceAccount,
    enums::ServiceStatus,
};

#[derive(Accounts)]
pub struct UpdateService<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,
}

impl<'info> UpdateService<'info> {
    pub fn update_service(
        &mut self,
        new_authority: Option<Pubkey>,
        new_default_policy: Option<Pubkey>,
    ) -> Result<()> {
        let service = &mut self.service;

        require!(service.status != ServiceStatus::Disabled, ErrorCode::ServiceDisabled);

        if let Some(a) = new_authority {
            service.authority = a;
        }

        if let Some(p) = new_default_policy {
            service.default_policy = p;
        }

        emit!(ServiceUpdated {
            service: self.service.key(),
            new_authority,
            new_default_policy,
        });

        Ok(())
    }
}