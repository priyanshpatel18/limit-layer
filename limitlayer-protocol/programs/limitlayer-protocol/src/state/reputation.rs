use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ReputationAccount {
    pub subject: Pubkey,
    pub global_score: i64,
    pub signal_count: u64,
    pub last_updated_ts: i64,
    pub flags: u32,
    pub bump: u8,
}
