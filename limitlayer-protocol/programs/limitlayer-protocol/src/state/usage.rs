use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UsageCheckpoint {
    pub api_key: Pubkey,
    pub window_start: i64,
    pub request_count: u64,
    pub cost_accumulated: u64,
    pub last_updated: i64,
    pub bump: u8,
}
