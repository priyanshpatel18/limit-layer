use anchor_lang::prelude::*;

use crate::{
    constants::*,
    events::AbuseSignalEmitted,
    error::ErrorCode,
    state::{AbuseSignal, ReputationAccount, ServiceAccount},
};

#[derive(Accounts)]
pub struct EmitAbuseSignal<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + AbuseSignal::INIT_SPACE,
        seeds = [
            ABUSE_SIGNAL_SEED.as_bytes(),
            reputation.subject.as_ref(),
            Clock::get().expect("Clock sysvar required").unix_timestamp.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub abuse_signal: Account<'info, AbuseSignal>,

    #[account(mut)]
    pub reputation: Account<'info, ReputationAccount>,

    pub system_program: Program<'info, System>,
}

impl<'info> EmitAbuseSignal<'info> {
    pub fn emit_abuse_signal(
        &mut self,
        severity: u8,
        category: u32,
        bumps: EmitAbuseSignalBumps,
    ) -> Result<()> {
        require!(severity <= MAX_SEVERITY, ErrorCode::InvalidSeverity);

        let now = Clock::get()?.unix_timestamp;

        self.abuse_signal.set_inner(AbuseSignal {
            reporter_service: self.service.key(),
            subject: self.reputation.subject,
            severity,
            category,
            created_ts: now,
            bump: bumps.abuse_signal,
        });

        self.reputation.signal_count += 1;
        self.reputation.last_updated_ts = now;
        self.reputation.flags |= category;

        emit!(AbuseSignalEmitted {
            abuse_signal: self.abuse_signal.key(),
            reporter_service: self.service.key(),
            subject: self.reputation.subject,
            severity,
            category,
        });

        Ok(())
    }
}
