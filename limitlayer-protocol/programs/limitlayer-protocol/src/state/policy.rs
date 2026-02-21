use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RateLimitPolicy {
    pub service: Pubkey,
    pub requests_per_window: u64,
    pub window_seconds: u64,
    pub burst_limit: u64,
    pub cost_per_request: u64,
    pub bump: u8,
}