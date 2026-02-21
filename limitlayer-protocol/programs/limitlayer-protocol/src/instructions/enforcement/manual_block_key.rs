use anchor_lang::prelude::*;

use crate::{
    enums::ApiKeyStatus,
    events::KeyManuallyBlocked,
    error::ErrorCode,
    state::{ApiKeyAccount, ServiceAccount},
};

#[derive(Accounts)]
pub struct ManualBlockKey<'info> {
    pub authority: Signer<'info>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        mut,
        constraint = api_key.service == service.key() @ ErrorCode::InvalidApiKey
    )]
    pub api_key: Account<'info, ApiKeyAccount>,
}

impl<'info> ManualBlockKey<'info> {
    pub fn manual_block_key(&mut self) -> Result<()> {
        self.api_key.status = ApiKeyStatus::Blocked;
        emit!(KeyManuallyBlocked {
            api_key: self.api_key.key(),
            service: self.service.key(),
        });
        Ok(())
    }
}
