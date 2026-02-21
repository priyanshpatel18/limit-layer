use anchor_lang::prelude::*;

use crate::{
    error::ErrorCode,
    events::ServiceStatusChanged,
    state::ServiceAccount,
    enums::ServiceStatus,
};

#[derive(Accounts)]
pub struct SetServiceStatus<'info> {
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = service.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub service: Account<'info, ServiceAccount>,
}

impl<'info> SetServiceStatus<'info> {
    pub fn set_service_status(
        &mut self,
        new_status: ServiceStatus,
    ) -> Result<()> {
        let service = &mut self.service;

        if service.status == ServiceStatus::Disabled && new_status != ServiceStatus::Disabled {
            return err!(ErrorCode::InvalidServiceStatusTransition);
        }

        match (service.status, new_status) {
            (ServiceStatus::Active, ServiceStatus::Paused)
            | (ServiceStatus::Paused, ServiceStatus::Active)
            | (_, ServiceStatus::Disabled) => {
                service.status = new_status;
            }
            _ => return err!(ErrorCode::InvalidServiceStatusTransition),
        }

        let status_u8 = match new_status {
            ServiceStatus::Active => 0,
            ServiceStatus::Paused => 1,
            ServiceStatus::Disabled => 2,
        };
        emit!(ServiceStatusChanged {
            service: self.service.key(),
            new_status: status_u8,
        });

        Ok(())
    }
}