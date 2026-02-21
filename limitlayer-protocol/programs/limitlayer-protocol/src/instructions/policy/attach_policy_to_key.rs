use anchor_lang::prelude::*;

use crate::{
    error::ErrorCode,
    events::PolicyAttachedToKey,
    state::{ApiKeyAccount, RateLimitPolicy, ServiceAccount},
};

#[derive(Accounts)]
pub struct AttachPolicyToKey<'info> {
    pub authority: Signer<'info>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        constraint = policy.service == service.key() @ ErrorCode::InvalidPolicy
    )]
    pub policy: Account<'info, RateLimitPolicy>,

    #[account(
        mut,
        constraint = api_key.service == service.key() @ ErrorCode::InvalidApiKey
    )]
    pub api_key: Account<'info, ApiKeyAccount>,
}

impl<'info> AttachPolicyToKey<'info> {
    pub fn attach_policy_to_key(&mut self) -> Result<()> {
        self.api_key.policy = self.policy.key();
        emit!(PolicyAttachedToKey {
            api_key: self.api_key.key(),
            policy: self.policy.key(),
            service: self.service.key(),
        });
        Ok(())
    }
}
