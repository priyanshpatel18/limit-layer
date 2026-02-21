use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::commit;
use ephemeral_rollups_sdk::ephem::commit_accounts;

use crate::{
    error::ErrorCode,
    events::UsageCheckpointSubmitted,
    state::DelegatedUsageAccount,
};

#[commit]
#[derive(Accounts)]
pub struct SubmitUsageCheckpoint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,
}

impl<'info> SubmitUsageCheckpoint<'info> {
    pub fn submit_usage_checkpoint(&mut self) -> Result<()> {
        let d = &mut self.delegated_usage;

        require!(d.delegated, ErrorCode::NotDelegated);

        let window_usage = d.current_window_usage;

        // Only delegated_usage is writable on ER; api_key/service/protocol updates
        // can be applied via apply_checkpoint on base layer after commit confirms.
        d.current_window_usage = 0;
        d.burst_counter = 0;
        d.window_start_ts = Clock::get()?.unix_timestamp;

        emit!(UsageCheckpointSubmitted {
            delegated_usage: d.key(),
            api_key: d.api_key,
            service: Pubkey::default(),
            window_usage,
        });

        commit_accounts(
            &self.payer,
            vec![&self.delegated_usage.to_account_info()],
            &self.magic_context,
            &self.magic_program,
        )?;

        Ok(())
    }
}