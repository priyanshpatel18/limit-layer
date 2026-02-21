use anchor_lang::prelude::*;

use crate::{
    enums::ApiKeyStatus,
    events::ApiKeyRevoked,
    error::ErrorCode,
    state::{ApiKeyAccount, ServiceAccount},
};

#[derive(Accounts)]
pub struct RevokeApiKey<'info> {
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

impl<'info> RevokeApiKey<'info> {
    pub fn revoke_api_key(&mut self) -> Result<()> {
        self.api_key.status = ApiKeyStatus::Revoked;
        emit!(ApiKeyRevoked {
            api_key: self.api_key.key(),
            service: self.service.key(),
        });
        Ok(())
    }
}
