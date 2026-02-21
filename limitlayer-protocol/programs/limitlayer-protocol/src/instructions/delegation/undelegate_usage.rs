use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::commit;
use ephemeral_rollups_sdk::ephem::commit_and_undelegate_accounts;

use crate::{error::ErrorCode, events::UsageUndelegated, state::DelegatedUsageAccount};

#[commit]
#[derive(Accounts)]
pub struct UndelegateUsage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,

    /// CHECK magic
    pub magic_context: AccountInfo<'info>,
    /// CHECK magic
    pub magic_program: AccountInfo<'info>,
}

impl<'info> UndelegateUsage<'info> {
    pub fn undelegate_usage(&mut self) -> Result<()> {
        let d = &mut self.delegated_usage;

        require!(d.delegated, ErrorCode::NotDelegated);

        let api_key = d.api_key;
        d.delegated = false;

        emit!(UsageUndelegated {
            delegated_usage: d.key(),
            api_key,
        });

        d.exit(&crate::ID)?;

        commit_and_undelegate_accounts(
            &self.payer,
            vec![&self.delegated_usage.to_account_info()],
            &self.magic_context,
            &self.magic_program,
        )?;

        Ok(())
    }
}