use anchor_lang::prelude::*;

use crate::{
    enums::ApiKeyStatus,
    events::ApiKeyStatusChanged,
    error::ErrorCode,
    state::{ApiKeyAccount, ServiceAccount},
};

#[derive(Accounts)]
pub struct SetApiKeyStatus<'info> {
    pub authority: Signer<'info>,

    #[account(
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,

    #[account(
        mut,
        constraint = api_key.service == service.key() @ ErrorCode::InvalidApiKey
    )]
    pub api_key: Account<'info, ApiKeyAccount>,
}

impl<'info> SetApiKeyStatus<'info> {
    pub fn set_api_key_status(&mut self, new_status: ApiKeyStatus) -> Result<()> {
        let key = &mut self.api_key;

        if key.status == ApiKeyStatus::Revoked {
            return err!(ErrorCode::InvalidApiKeyStatusTransition);
        }

        match (key.status, new_status) {
            (ApiKeyStatus::Active, ApiKeyStatus::Throttled)
            | (ApiKeyStatus::Throttled, ApiKeyStatus::Active)
            | (_, ApiKeyStatus::Blocked)
            | (ApiKeyStatus::Blocked, ApiKeyStatus::Active) => {
                key.status = new_status;
            }
            _ => return err!(ErrorCode::InvalidApiKeyStatusTransition),
        }

        let status_u8 = match new_status {
            ApiKeyStatus::Active => 0,
            ApiKeyStatus::Throttled => 1,
            ApiKeyStatus::Blocked => 2,
            ApiKeyStatus::Revoked => 3,
        };
        emit!(ApiKeyStatusChanged {
            api_key: self.api_key.key(),
            service: self.service.key(),
            new_status: status_u8,
        });

        Ok(())
    }
}
