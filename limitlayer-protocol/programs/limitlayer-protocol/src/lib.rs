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

declare_id!("LiLyRHkivstck1s3E58W6pcUobaEz2iAtcNZFXuAQu7");

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
        ctx.accounts
            .set_service_status(new_status)
    }
}