use anchor_lang::prelude::*;

use crate::ApiKeyStatus;

#[account]
#[derive(InitSpace)]
pub struct ApiKeyAccount {
    pub service: Pubkey,
    pub owner: Pubkey,
    pub policy: Pubkey,
    pub reputation: Pubkey,
    pub status: ApiKeyStatus,
    pub lifetime_usage: u128,
    pub last_checkpoint_ts: i64,
    pub bump: u8,
}
