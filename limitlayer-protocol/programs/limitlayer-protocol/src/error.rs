use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    // Generic
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid input")]
    InvalidInput,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Protocol is paused")]
    ProtocolPaused,

    // Protocol
    #[msg("Protocol already initialized")]
    ProtocolAlreadyInitialized,
    #[msg("Invalid protocol fee")]
    InvalidProtocolFee,

    // Service
    #[msg("Service name too long")]
    ServiceNameTooLong,
    #[msg("Invalid service")]
    InvalidService,
    #[msg("Service disabled")]
    ServiceDisabled,
    #[msg("Invalid service status transition")]
    InvalidServiceStatusTransition,

    // Policy
    #[msg("Invalid policy")]
    InvalidPolicy,
    #[msg("Policy disabled")]
    PolicyDisabled,
    #[msg("Invalid rate limit configuration")]
    InvalidRateLimitConfig,

    // API Key
    #[msg("Invalid API key")]
    InvalidApiKey,
    #[msg("API key inactive")]
    ApiKeyInactive,
    #[msg("API key blocked")]
    ApiKeyBlocked,
    #[msg("API key revoked")]
    ApiKeyRevoked,
    #[msg("Invalid API key status transition")]
    InvalidApiKeyStatusTransition,

    // Delegation (MagicBlock)
    #[msg("Already delegated")]
    AlreadyDelegated,
    #[msg("Not delegated")]
    NotDelegated,
    #[msg("Invalid delegation state; call prepare_delegation first")]
    InvalidDelegationState,
    #[msg("Invalid execution region")]
    InvalidExecutionRegion,
    #[msg("Delegation requires final checkpoint")]
    DelegationRequiresCheckpoint,

    // Usage / Rate limiting
    #[msg("Rate limit exceeded")]
    RateLimitExceeded,
    #[msg("Burst limit exceeded")]
    BurstLimitExceeded,
    #[msg("Invalid usage window")]
    InvalidWindow,
    #[msg("Window not finished")]
    WindowNotFinished,
    #[msg("Checkpoint sequence invalid")]
    InvalidCheckpointSequence,
    #[msg("Checkpoint regression detected")]
    CheckpointRegression,

    // Enforcement
    #[msg("Manual block prevents change")]
    ManualBlockActive,
    #[msg("Enforcement skipped due to missing data")]
    EnforcementDataMissing,

    // Abuse / Reputation
    #[msg("Invalid abuse severity")]
    InvalidSeverity,
    #[msg("Duplicate abuse signal")]
    DuplicateAbuseSignal,
    #[msg("Reputation too low")]
    ReputationTooLow,
    #[msg("Reputation overflow")]
    ReputationOverflow,
}