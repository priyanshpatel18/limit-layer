use anchor_lang::prelude::*;
use crate::{enums::ServiceStatus, constants::MAX_NAME_LEN};

#[account]
#[derive(InitSpace)]
pub struct ServiceAccount {
    pub authority: Pubkey,
    #[max_len(MAX_NAME_LEN)]
    pub name: String,
    pub status: ServiceStatus,
    pub default_policy: Pubkey,
    pub total_usage_units: u128,
    pub created_ts: i64,
    pub bump: u8,
}
