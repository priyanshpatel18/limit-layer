use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DelegatedUsageAccount {
    pub api_key: Pubkey,
    pub policy: Pubkey,
    pub execution_region: Pubkey,
    pub delegated: bool,
    pub delegation_seq: u64,
    pub window_start_ts: i64,
    pub current_window_usage: u64,
    pub burst_counter: u64,
    pub last_update_ts: i64,
    pub delegated_at: i64,
    pub bump: u8,
}
