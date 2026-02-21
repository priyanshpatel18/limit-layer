use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::commit;
use ephemeral_rollups_sdk::ephem::commit_accounts;

use crate::{
    error::ErrorCode,
    events::UsageCheckpointSubmitted,
    state::{ApiKeyAccount, DelegatedUsageAccount, ProtocolState, ServiceAccount},
};

#[commit]
#[derive(Accounts)]
pub struct SubmitUsageCheckpoint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,

    #[account(mut)]
    pub api_key: Account<'info, ApiKeyAccount>,

    #[account(mut)]
    pub service: Account<'info, ServiceAccount>,

    #[account(mut)]
    pub protocol: Account<'info, ProtocolState>,

    /// CHECK magic
    pub magic_context: AccountInfo<'info>,
    /// CHECK magic
    pub magic_program: AccountInfo<'info>,
}

impl<'info> SubmitUsageCheckpoint<'info> {
    pub fn submit_usage_checkpoint(&mut self) -> Result<()> {
        let d = &mut self.delegated_usage;

        require!(d.delegated, ErrorCode::NotDelegated);

        let window_usage = d.current_window_usage;

        self.api_key.lifetime_usage = self
            .api_key
            .lifetime_usage
            .checked_add(d.current_window_usage as u128)
            .ok_or(ErrorCode::MathOverflow)?;

        self.service.total_usage_units = self
            .service
            .total_usage_units
            .checked_add(d.current_window_usage as u128)
            .ok_or(ErrorCode::MathOverflow)?;

        self.protocol.total_usage_checkpoints += 1;

        self.api_key.last_checkpoint_ts = Clock::get()?.unix_timestamp;

        d.current_window_usage = 0;
        d.burst_counter = 0;
        d.window_start_ts = Clock::get()?.unix_timestamp;

        emit!(UsageCheckpointSubmitted {
            delegated_usage: self.delegated_usage.key(),
            api_key: self.api_key.key(),
            service: self.service.key(),
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