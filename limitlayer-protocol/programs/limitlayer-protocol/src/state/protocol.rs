use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ProtocolState {
    pub admin_authority: Pubkey,
    pub treasury: Pubkey,
    pub protocol_fee_bps: u16,
    pub paused: bool,
    pub service_count: u64,
    pub api_key_count: u64,
    pub total_usage_checkpoints: u64,
    pub bump: u8,
}