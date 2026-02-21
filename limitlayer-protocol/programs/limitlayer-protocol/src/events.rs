use anchor_lang::prelude::*;

#[event]
pub struct ProtocolInitialized {
    pub protocol: Pubkey,
    pub admin: Pubkey,
    pub treasury: Pubkey,
    pub protocol_fee_bps: u16,
}

#[event]
pub struct ProtocolUpdated {
    pub protocol: Pubkey,
    pub new_fee_bps: Option<u16>,
    pub new_treasury: Option<Pubkey>,
    pub paused: Option<bool>,
}

#[event]
pub struct ServiceCreated {
    pub service: Pubkey,
    pub protocol: Pubkey,
    pub authority: Pubkey,
    pub name: String,
    pub default_policy: Pubkey,
}

#[event]
pub struct ServiceUpdated {
    pub service: Pubkey,
    pub new_authority: Option<Pubkey>,
    pub new_default_policy: Option<Pubkey>,
}

#[event]
pub struct ServiceStatusChanged {
    pub service: Pubkey,
    pub new_status: u8,
}

#[event]
pub struct PolicyCreated {
    pub policy: Pubkey,
    pub service: Pubkey,
    pub requests_per_window: u64,
    pub window_seconds: u64,
    pub burst_limit: u64,
    pub cost_per_request: u64,
}

#[event]
pub struct PolicyUpdated {
    pub policy: Pubkey,
    pub requests_per_window: Option<u64>,
    pub window_seconds: Option<u64>,
    pub burst_limit: Option<u64>,
    pub cost_per_request: Option<u64>,
}

#[event]
pub struct PolicyAttachedToKey {
    pub api_key: Pubkey,
    pub policy: Pubkey,
    pub service: Pubkey,
}

#[event]
pub struct ApiKeyCreated {
    pub api_key: Pubkey,
    pub service: Pubkey,
    pub owner: Pubkey,
    pub policy: Pubkey,
}

#[event]
pub struct ApiKeyRevoked {
    pub api_key: Pubkey,
    pub service: Pubkey,
}

#[event]
pub struct ApiKeyStatusChanged {
    pub api_key: Pubkey,
    pub service: Pubkey,
    pub new_status: u8,
}

#[event]
pub struct UsageDelegated {
    pub delegated_usage: Pubkey,
    pub api_key: Pubkey,
    pub policy: Pubkey,
    pub execution_region: Pubkey,
}

#[event]
pub struct UsageUndelegated {
    pub delegated_usage: Pubkey,
    pub api_key: Pubkey,
}

#[event]
pub struct UsageRecordedRealtime {
    pub delegated_usage: Pubkey,
    pub api_key: Pubkey,
    pub amount: u64,
    pub window_usage: u64,
}

#[event]
pub struct UsageCheckpointSubmitted {
    pub delegated_usage: Pubkey,
    pub api_key: Pubkey,
    pub service: Pubkey,
    pub window_usage: u64,
}

#[event]
pub struct EnforcementEvaluated {
    pub api_key: Pubkey,
    pub new_status: u8,
    pub usage: u64,
}

#[event]
pub struct KeyManuallyBlocked {
    pub api_key: Pubkey,
    pub service: Pubkey,
}

#[event]
pub struct KeyManuallyUnblocked {
    pub api_key: Pubkey,
    pub service: Pubkey,
}

#[event]
pub struct AbuseSignalEmitted {
    pub abuse_signal: Pubkey,
    pub reporter_service: Pubkey,
    pub subject: Pubkey,
    pub severity: u8,
    pub category: u32,
}

#[event]
pub struct ReputationUpdated {
    pub reputation: Pubkey,
    pub subject: Pubkey,
    pub delta: i64,
    pub new_score: i64,
}
