use anchor_lang::prelude::*;

use crate::{
    constants::*,
    error::ErrorCode,
    events::ReputationUpdated,
    state::ReputationAccount,
};

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(mut)]
    pub reputation: Account<'info, ReputationAccount>,
}

impl<'info> UpdateReputation<'info> {
    pub fn update_reputation(&mut self, delta: i64) -> Result<()> {
        let rep = &mut self.reputation;

        rep.global_score = rep
            .global_score
            .checked_add(delta)
            .ok_or(ErrorCode::ReputationOverflow)?;

        if rep.global_score < REPUTATION_MIN {
            rep.global_score = REPUTATION_MIN;
        }

        if rep.global_score > REPUTATION_MAX {
            rep.global_score = REPUTATION_MAX;
        }

        rep.last_updated_ts = Clock::get()?.unix_timestamp;

        emit!(ReputationUpdated {
            reputation: rep.key(),
            subject: rep.subject,
            delta,
            new_score: rep.global_score,
        });

        Ok(())
    }
}
