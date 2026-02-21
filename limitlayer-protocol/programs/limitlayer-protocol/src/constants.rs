use anchor_lang::prelude::*;

/// PDA SEEDS
#[constant]
pub const PROTOCOL_SEED: &str = "protocol";
#[constant]
pub const SERVICE_SEED: &str = "service";
#[constant]
pub const POLICY_SEED: &str = "policy";
#[constant]
pub const API_KEY_SEED: &str = "api_key";
#[constant]
pub const USAGE_SEED: &str = "usage";
#[constant]
pub const DELEGATED_USAGE_SEED: &str = "delegated_usage";
#[constant]
pub const REPUTATION_SEED: &str = "reputation";
#[constant]
pub const ABUSE_SIGNAL_SEED: &str = "abuse_signal";

/// GENERAL LIMITS
#[constant]
pub const MAX_NAME_LEN: u32 = 64;
#[constant]
pub const MAX_FLAGS: u32 = u32::MAX;
#[constant]
pub const MAX_BPS: u16 = 10_000;
#[constant]
pub const MAX_SEVERITY: u8 = 10;

/// DEFAULTS
#[constant]
pub const DEFAULT_REPUTATION_SCORE: i64 = 0;
#[constant]
pub const DEFAULT_WINDOW_SECONDS: u64 = 60;
#[constant]
pub const MIN_WINDOW_SECONDS: u64 = 1;

/// Reputation bounds (prevent runaway math)
#[constant]
pub const REPUTATION_MIN: i64 = -1_000_000;
#[constant]
pub const REPUTATION_MAX: i64 = 1_000_000;

/// ABUSE FLAG BITS
#[constant]
pub const FLAG_SPAM: u32 = 1 << 0;
#[constant]
pub const FLAG_BOT: u32 = 1 << 1;
#[constant]
pub const FLAG_SUSPICIOUS_BURST: u32 = 1 << 2;
#[constant]
pub const FLAG_MANUAL_BLOCK: u32 = 1 << 3;