use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::ephemeral;

pub mod constants;
pub mod enums;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use events::*;
pub use enums::*;
pub use instructions::*;
pub use state::*;

declare_id!("LLycnqAcLQoVRqQ1jrisJL4oacnkDE6sZnM6MHHxixm");

#[ephemeral]
#[program]
pub mod limitlayer_protocol {
    use super::*;

    // PROTOCOL
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        protocol_fee_bps: u16,
        treasury: Pubkey,
    ) -> Result<()> {
        ctx.accounts
            .initialize_protocol(protocol_fee_bps, treasury, ctx.bumps)
    }

    pub fn update_protocol(
        ctx: Context<UpdateProtocol>,
        new_fee_bps: Option<u16>,
        new_treasury: Option<Pubkey>,
        paused: Option<bool>,
    ) -> Result<()> {
        ctx.accounts
            .update_protocol(new_fee_bps, new_treasury, paused)
    }

    // SERVICE
    pub fn create_service(
        ctx: Context<CreateService>,
        name: String,
        default_policy: Pubkey,
    ) -> Result<()> {
        ctx.accounts
            .create_service(name, default_policy, ctx.bumps)
    }

    pub fn update_service(
        ctx: Context<UpdateService>,
        new_authority: Option<Pubkey>,
        new_default_policy: Option<Pubkey>,
    ) -> Result<()> {
        ctx.accounts
            .update_service(new_authority, new_default_policy)
    }

    pub fn set_service_status(
        ctx: Context<SetServiceStatus>,
        new_status: ServiceStatus,
    ) -> Result<()> {
        ctx.accounts.set_service_status(new_status)
    }

    // POLICY
    pub fn create_policy(
        ctx: Context<CreatePolicy>,
        requests_per_window: u64,
        window_seconds: u64,
        burst_limit: u64,
        cost_per_request: u64,
    ) -> Result<()> {
        ctx.accounts.create_policy(
            requests_per_window,
            window_seconds,
            burst_limit,
            cost_per_request,
            ctx.bumps,
        )
    }

    pub fn update_policy(
        ctx: Context<UpdatePolicy>,
        requests_per_window: Option<u64>,
        window_seconds: Option<u64>,
        burst_limit: Option<u64>,
        cost_per_request: Option<u64>,
    ) -> Result<()> {
        ctx.accounts.update_policy(
            requests_per_window,
            window_seconds,
            burst_limit,
            cost_per_request,
        )
    }

    pub fn attach_policy_to_key(
        ctx: Context<AttachPolicyToKey>,
    ) -> Result<()> {
        ctx.accounts.attach_policy_to_key()
    }

    // API KEY
    pub fn create_api_key(
        ctx: Context<CreateApiKey>,
        policy: Pubkey,
    ) -> Result<()> {
        ctx.accounts.create_api_key(policy, ctx.bumps)
    }

    pub fn revoke_api_key(
        ctx: Context<RevokeApiKey>,
    ) -> Result<()> {
        ctx.accounts.revoke_api_key()
    }

    pub fn set_api_key_status(
        ctx: Context<SetApiKeyStatus>,
        new_status: ApiKeyStatus,
    ) -> Result<()> {
        ctx.accounts.set_api_key_status(new_status)
    }

    // MAGICBLOCK DELEGATION
    pub fn prepare_delegation(
        ctx: Context<PrepareDelegation>,
        execution_region: Pubkey,
    ) -> Result<()> {
        ctx.accounts.prepare_delegation(execution_region)
    }

    pub fn delegate_usage(
        ctx: Context<DelegateUsage>,
        execution_region: Pubkey,
    ) -> Result<()> {
        ctx.accounts.delegate_usage(execution_region, ctx.bumps)
    }

    pub fn record_usage_realtime(
        ctx: Context<RecordUsageRealtime>,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.record_usage_realtime(amount)
    }

    pub fn submit_usage_checkpoint(
        ctx: Context<SubmitUsageCheckpoint>,
    ) -> Result<()> {
        ctx.accounts.submit_usage_checkpoint()
    }

    pub fn undelegate_usage(
        ctx: Context<UndelegateUsage>,
    ) -> Result<()> {
        ctx.accounts.undelegate_usage()
    }

    // ENFORCEMENT
    pub fn evaluate_enforcement(
        ctx: Context<EvaluateEnforcement>,
    ) -> Result<()> {
        ctx.accounts.evaluate_enforcement()
    }

    pub fn manual_block_key(
        ctx: Context<ManualBlockKey>,
    ) -> Result<()> {
        ctx.accounts.manual_block_key()
    }

    pub fn manual_unblock_key(
        ctx: Context<ManualUnblockKey>,
    ) -> Result<()> {
        ctx.accounts.manual_unblock_key()
    }

    // ABUSE / REPUTATION
    pub fn emit_abuse_signal(
        ctx: Context<EmitAbuseSignal>,
        severity: u8,
        category: u32,
    ) -> Result<()> {
        ctx.accounts.emit_abuse_signal(severity, category, ctx.bumps)
    }

    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        delta: i64,
    ) -> Result<()> {
        ctx.accounts.update_reputation(delta)
    }
}