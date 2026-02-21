use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::delegate;
use ephemeral_rollups_sdk::cpi::DelegateConfig;

use crate::{constants::*, events::UsageDelegated, state::ApiKeyAccount};

/// Minimal delegate: payer + PDA to delegate. Call after prepare_delegation.
#[delegate]
#[derive(Accounts)]
pub struct DelegateUsage<'info> {
    /// Payer for delegation CPI
    pub payer: Signer<'info>,

    pub api_key: Account<'info, ApiKeyAccount>,

    /// CHECK: The PDA to delegate
    #[account(mut, del)]
    pub pda: AccountInfo<'info>,
}

impl<'info> DelegateUsage<'info> {
    pub fn delegate_usage(
        &mut self,
        execution_region: Pubkey,
        _bumps: DelegateUsageBumps,
    ) -> Result<()> {
        self.delegate_pda(
            &self.payer,
            &[DELEGATED_USAGE_SEED.as_bytes(), self.api_key.key().as_ref()],
            DelegateConfig {
                validator: Some(execution_region),
                ..Default::default()
            },
        )?;

        emit!(UsageDelegated {
            delegated_usage: self.pda.key(),
            api_key: self.api_key.key(),
            policy: self.api_key.policy,
            execution_region,
        });

        Ok(())
    }
}
