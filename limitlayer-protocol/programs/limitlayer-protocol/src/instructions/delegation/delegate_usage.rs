use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::delegate;
use ephemeral_rollups_sdk::cpi::DelegateConfig;

use crate::{
    constants::*,
    events::UsageDelegated,
    error::ErrorCode,
    state::{ApiKeyAccount, DelegatedUsageAccount, RateLimitPolicy, ServiceAccount},
};

#[delegate]
#[derive(Accounts)]
pub struct DelegateUsage<'info> {
    #[account(mut)]
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

    #[account(
        constraint = policy.key() == api_key.policy @ ErrorCode::InvalidPolicy
    )]
    pub policy: Account<'info, RateLimitPolicy>,

    /// CHECK delegated pda
    #[account(
        mut,
        seeds = [DELEGATED_USAGE_SEED.as_bytes(), api_key.key().as_ref()],
        bump,
        del
    )]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,

    /// payer for delegation CPI
    pub payer: Signer<'info>,
}

impl<'info> DelegateUsage<'info> {
    pub fn delegate_usage(
        &mut self,
        execution_region: Pubkey,
        bumps: DelegateUsageBumps,
    ) -> Result<()> {
        let d = &mut self.delegated_usage;

        require!(!d.delegated, ErrorCode::AlreadyDelegated);

        d.api_key = self.api_key.key();
        d.policy = self.policy.key();
        d.execution_region = execution_region;
        d.delegated = true;

        d.delegation_seq = d
            .delegation_seq
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        d.window_start_ts = Clock::get()?.unix_timestamp;
        d.current_window_usage = 0;
        d.burst_counter = 0;
        d.last_update_ts = Clock::get()?.unix_timestamp;
        d.delegated_at = Clock::get()?.unix_timestamp;
        d.bump = bumps.delegated_usage;

        self.delegate_delegated_usage(
            &self.payer,
            &[DELEGATED_USAGE_SEED.as_bytes(), self.api_key.key().as_ref()],
            DelegateConfig {
                validator: Some(execution_region),
                ..Default::default()
            },
        )?;

        emit!(UsageDelegated {
            delegated_usage: self.delegated_usage.key(),
            api_key: self.api_key.key(),
            policy: self.policy.key(),
            execution_region,
        });

        Ok(())
    }
}
