use anchor_lang::prelude::*;

use crate::{
    constants::*,
    events::PolicyCreated,
    error::ErrorCode,
    state::{RateLimitPolicy, ServiceAccount},
};

#[derive(Accounts)]
pub struct CreatePolicy<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + RateLimitPolicy::INIT_SPACE,
        seeds = [
            POLICY_SEED.as_bytes(),
            service.key().as_ref(),
            service.total_usage_units.to_le_bytes().as_ref() // simple deterministic seed slot
        ],
        bump
    )]
    pub policy: Account<'info, RateLimitPolicy>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreatePolicy<'info> {
    pub fn create_policy(
        &mut self,
        requests_per_window: u64,
        window_seconds: u64,
        burst_limit: u64,
        cost_per_request: u64,
        bumps: CreatePolicyBumps,
    ) -> Result<()> {
        require!(requests_per_window > 0, ErrorCode::InvalidRateLimitConfig);
        require!(
            window_seconds >= MIN_WINDOW_SECONDS,
            ErrorCode::InvalidRateLimitConfig
        );
        require!(
            burst_limit <= requests_per_window,
            ErrorCode::InvalidRateLimitConfig
        );

        self.policy.set_inner(RateLimitPolicy {
            service: self.service.key(),
            requests_per_window,
            window_seconds,
            burst_limit,
            cost_per_request,
            bump: bumps.policy,
        });

        emit!(PolicyCreated {
            policy: self.policy.key(),
            service: self.service.key(),
            requests_per_window,
            window_seconds,
            burst_limit,
            cost_per_request,
        });

        Ok(())
    }
}
