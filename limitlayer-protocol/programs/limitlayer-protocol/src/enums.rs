use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum ServiceStatus {
    Active,
    Paused,
    Disabled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum ApiKeyStatus {
    Active,
    Throttled,
    Blocked,
    Revoked,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum PolicyStatus {
    Active,
    Disabled,
}