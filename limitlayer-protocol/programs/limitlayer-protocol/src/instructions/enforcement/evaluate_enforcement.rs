use anchor_lang::prelude::*;

use crate::{
    enums::ApiKeyStatus,
    events::EnforcementEvaluated,
    state::{ApiKeyAccount, DelegatedUsageAccount, RateLimitPolicy},
};

#[derive(Accounts)]
pub struct EvaluateEnforcement<'info> {
    #[account(mut)]
    pub api_key: Account<'info, ApiKeyAccount>,

    pub policy: Account<'info, RateLimitPolicy>,

    pub delegated_usage: Account<'info, DelegatedUsageAccount>,
}

impl<'info> EvaluateEnforcement<'info> {
    pub fn evaluate_enforcement(&mut self) -> Result<()> {
        let usage = self.delegated_usage.current_window_usage;

        if usage >= self.policy.requests_per_window {
            self.api_key.status = ApiKeyStatus::Blocked;
        } else if usage >= self.policy.requests_per_window / 2 {
            self.api_key.status = ApiKeyStatus::Throttled;
        } else {
            if self.api_key.status != ApiKeyStatus::Blocked {
                self.api_key.status = ApiKeyStatus::Active;
            }
        }

        let status_u8 = match self.api_key.status {
            ApiKeyStatus::Active => 0,
            ApiKeyStatus::Throttled => 1,
            ApiKeyStatus::Blocked => 2,
            ApiKeyStatus::Revoked => 3,
        };
        emit!(EnforcementEvaluated {
            api_key: self.api_key.key(),
            new_status: status_u8,
            usage,
        });

        Ok(())
    }
}
