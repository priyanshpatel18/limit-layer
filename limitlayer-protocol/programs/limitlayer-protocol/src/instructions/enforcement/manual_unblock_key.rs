use anchor_lang::prelude::*;

use crate::{
    enums::ApiKeyStatus,
    events::KeyManuallyUnblocked,
    error::ErrorCode,
    state::{ApiKeyAccount, ServiceAccount},
};

#[derive(Accounts)]
pub struct ManualUnblockKey<'info> {
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

impl<'info> ManualUnblockKey<'info> {
    pub fn manual_unblock_key(&mut self) -> Result<()> {
        require!(
            self.api_key.status != ApiKeyStatus::Revoked,
            ErrorCode::InvalidApiKeyStatusTransition
        );

        self.api_key.status = ApiKeyStatus::Active;
        emit!(KeyManuallyUnblocked {
            api_key: self.api_key.key(),
            service: self.service.key(),
        });
        Ok(())
    }
}
