use anchor_lang::prelude::*;

use crate::{
    constants::DELEGATED_USAGE_SEED,
    error::ErrorCode,
    state::{ApiKeyAccount, DelegatedUsageAccount, RateLimitPolicy, ServiceAccount},
};

#[derive(Accounts)]
pub struct PrepareDelegation<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        constraint = api_key.service == service.key() @ ErrorCode::InvalidApiKey
    )]
    pub api_key: Account<'info, ApiKeyAccount>,

    #[account(
        constraint = policy.key() == api_key.policy @ ErrorCode::InvalidPolicy
    )]
    pub policy: Account<'info, RateLimitPolicy>,

    #[account(
        mut,
        seeds = [DELEGATED_USAGE_SEED.as_bytes(), api_key.key().as_ref()],
        bump = delegated_usage.bump
    )]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,
}

impl<'info> PrepareDelegation<'info> {
    pub fn prepare_delegation(&mut self, execution_region: Pubkey) -> Result<()> {
        let d = &mut self.delegated_usage;

        require!(!d.delegated, ErrorCode::AlreadyDelegated);

        d.api_key = self.api_key.key();
        d.policy = self.policy.key();
        d.execution_region = execution_region;

        d.delegation_seq = d
            .delegation_seq
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        let now = Clock::get()?.unix_timestamp;
        d.window_start_ts = now;
        d.current_window_usage = 0;
        d.burst_counter = 0;
        d.last_update_ts = now;
        d.delegated = true;
        d.delegated_at = now;

        Ok(())
    }
}
