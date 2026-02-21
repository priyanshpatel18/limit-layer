use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct AbuseSignal {
    pub reporter_service: Pubkey,
    pub subject: Pubkey,
    pub severity: u8,
    pub category: u32,
    pub created_ts: i64,
    pub bump: u8,
}

