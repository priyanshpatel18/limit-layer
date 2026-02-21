use anchor_lang::prelude::*;

use crate::{
    error::ErrorCode,
    events::UsageRecordedRealtime,
    enums::ApiKeyStatus,
    state::{ApiKeyAccount, DelegatedUsageAccount, RateLimitPolicy},
};

#[derive(Accounts)]
pub struct RecordUsageRealtime<'info> {
    #[account(mut)]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,

    /// Read-only; only delegated_usage can be written on ER
    pub api_key: Account<'info, ApiKeyAccount>,

    pub policy: Account<'info, RateLimitPolicy>,
}

impl<'info> RecordUsageRealtime<'info> {
    pub fn record_usage_realtime(&mut self, amount: u64) -> Result<()> {
        let d = &mut self.delegated_usage;

        require!(d.delegated, ErrorCode::NotDelegated);

        match self.api_key.status {
            ApiKeyStatus::Blocked | ApiKeyStatus::Revoked => {
                return err!(ErrorCode::ApiKeyBlocked)
            }
            _ => {}
        }

        d.current_window_usage = d
            .current_window_usage
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        d.burst_counter = d
            .burst_counter
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        require!(
            d.burst_counter <= self.policy.burst_limit,
            ErrorCode::BurstLimitExceeded
        );

        d.last_update_ts = Clock::get()?.unix_timestamp;

        emit!(UsageRecordedRealtime {
            delegated_usage: d.key(),
            api_key: self.api_key.key(),
            amount,
            window_usage: d.current_window_usage,
        });

        Ok(())
    }
}