use anchor_lang::prelude::*;

use crate::{
    constants::*,
    events::PolicyUpdated,
    error::ErrorCode,
    state::{RateLimitPolicy, ServiceAccount},
};

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    pub authority: Signer<'info>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        mut,
        constraint = policy.service == service.key() @ ErrorCode::InvalidPolicy
    )]
    pub policy: Account<'info, RateLimitPolicy>,
}

impl<'info> UpdatePolicy<'info> {
    pub fn update_policy(
        &mut self,
        requests_per_window: Option<u64>,
        window_seconds: Option<u64>,
        burst_limit: Option<u64>,
        cost_per_request: Option<u64>,
    ) -> Result<()> {
        let policy = &mut self.policy;

        if let Some(r) = requests_per_window {
            require!(r > 0, ErrorCode::InvalidRateLimitConfig);
            policy.requests_per_window = r;
        }

        if let Some(w) = window_seconds {
            require!(w >= MIN_WINDOW_SECONDS, ErrorCode::InvalidRateLimitConfig);
            policy.window_seconds = w;
        }

        if let Some(b) = burst_limit {
            require!(
                b <= policy.requests_per_window,
                ErrorCode::InvalidRateLimitConfig
            );
            policy.burst_limit = b;
        }

        if let Some(c) = cost_per_request {
            policy.cost_per_request = c;
        }

        emit!(PolicyUpdated {
            policy: self.policy.key(),
            requests_per_window,
            window_seconds,
            burst_limit,
            cost_per_request,
        });

        Ok(())
    }
}
