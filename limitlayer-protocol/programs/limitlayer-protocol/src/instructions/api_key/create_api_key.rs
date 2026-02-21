use anchor_lang::prelude::*;

use crate::{
    constants::*,
    events::ApiKeyCreated,
    enums::ApiKeyStatus,
    error::ErrorCode,
    state::{
        ApiKeyAccount, DelegatedUsageAccount, ProtocolState, ReputationAccount,
        ServiceAccount,
    },
};

#[derive(Accounts)]
pub struct CreateApiKey<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PROTOCOL_SEED.as_bytes()],
        bump = protocol.bump,
        constraint = !protocol.paused @ ErrorCode::ProtocolPaused
    )]
    pub protocol: Account<'info, ProtocolState>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + ApiKeyAccount::INIT_SPACE,
        seeds = [
            API_KEY_SEED.as_bytes(),
            protocol.api_key_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub api_key: Account<'info, ApiKeyAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + DelegatedUsageAccount::INIT_SPACE,
        seeds = [DELEGATED_USAGE_SEED.as_bytes(), api_key.key().as_ref()],
        bump
    )]
    pub delegated_usage: Account<'info, DelegatedUsageAccount>,

    /// CHECK: created if needed (shared identity)
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + ReputationAccount::INIT_SPACE,
        seeds = [REPUTATION_SEED.as_bytes(), owner.key().as_ref()],
        bump
    )]
    pub reputation: Account<'info, ReputationAccount>,

    /// CHECK: owner of the key (consumer identity); authority decides trust
    pub owner: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreateApiKey<'info> {
    pub fn create_api_key(&mut self, policy: Pubkey, bumps: CreateApiKeyBumps) -> Result<()> {
        let protocol = &mut self.protocol;

        protocol.api_key_count = protocol
            .api_key_count
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;

        self.api_key.set_inner(ApiKeyAccount {
            service: self.service.key(),
            owner: self.owner.key(),
            policy,
            reputation: self.reputation.key(),
            status: ApiKeyStatus::Active,
            lifetime_usage: 0,
            last_checkpoint_ts: 0,
            bump: bumps.api_key,
        });

        if self.reputation.subject == Pubkey::default() {
            self.reputation.set_inner(ReputationAccount {
                subject: self.owner.key(),
                global_score: DEFAULT_REPUTATION_SCORE,
                signal_count: 0,
                last_updated_ts: Clock::get()?.unix_timestamp,
                flags: 0,
                bump: bumps.reputation,
            });
        }

        let now = Clock::get()?.unix_timestamp;
        self.delegated_usage.set_inner(DelegatedUsageAccount {
            api_key: self.api_key.key(),
            policy,
            execution_region: Pubkey::default(),
            delegated: false,
            delegation_seq: 0,
            window_start_ts: now,
            current_window_usage: 0,
            burst_counter: 0,
            last_update_ts: now,
            delegated_at: 0,
            bump: bumps.delegated_usage,
        });

        emit!(ApiKeyCreated {
            api_key: self.api_key.key(),
            service: self.service.key(),
            owner: self.owner.key(),
            policy,
        });

        Ok(())
    }
}
