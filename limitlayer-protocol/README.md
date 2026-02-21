# Limit Layer Protocol

A decentralized rate limiting and API key management protocol built on Solana using the Anchor framework. This protocol provides a shared control plane for API identity, usage enforcement, reputation, and abuse signals—enabling verifiable rate limiting across services with delegated real-time execution.

## Overview

Limit Layer allows services to:

- Register as providers and define rate limit policies
- Issue API keys with configurable policies and reputation binding
- Delegate usage tracking to execution regions (MagicBlock) for high-frequency counters
- Submit deterministic checkpoints to canonical on-chain state
- Evaluate enforcement (block/throttle) based on policy and reputation
- Emit and consume abuse signals with shared reputation scoring

The protocol uses Program Derived Addresses (PDAs) throughout and integrates with [ephemeral rollups](https://ephemeral.network/) for delegated execution.

## Program ID

```
LLycnqAcLQoVRqQ1jrisJL4oacnkDE6sZnM6MHHxixm
```

- [Solana Explorer (Devnet)](https://explorer.solana.com/address/LLycnqAcLQoVRqQ1jrisJL4oacnkDE6sZnM6MHHxixm?cluster=devnet)

## Architecture

### Core Components

- **Protocol State**: Global configuration (admin, treasury, fees, pause, counters)
- **Service Account**: API provider registry with authority, default policy, and status
- **Rate Limit Policy**: Configurable limits (requests/window, window size, burst, cost)
- **API Key Account**: Consumer identity bound to policy, reputation, and usage
- **Delegated Usage Account**: Per-key usage state for real-time tracking (delegated to execution regions)
- **Usage Checkpoint**: Window-based aggregates for canonical state
- **Reputation Account**: Subject-scored reputation (shared across services)
- **Abuse Signal**: On-chain abuse reports with severity and category

### Key Features

- **PDA-Based Identity**: All critical accounts use Program Derived Addresses
- **Delegated Execution**: High-frequency usage counters via MagicBlock/ephemeral rollups
- **Deterministic Checkpoints**: Canonical state updated from verifiable checkpoints
- **Shared Reputation**: Reputation scores and abuse signals compose across services
- **Enforcement Lifecycle**: Active → Throttled → Blocked → Revoked with manual override support
- **Burst and Window Limits**: Configurable rate limits with burst protection

## Instructions

### Protocol

#### Initialize Protocol

Bootstraps the global protocol state.

```rust
pub fn initialize_protocol(
    ctx: Context<InitializeProtocol>,
    protocol_fee_bps: u16,
    treasury: Pubkey,
) -> Result<()>
```

**Parameters:**
- `protocol_fee_bps`: Fee in basis points (max 10,000)
- `treasury`: Treasury account for protocol fees

#### Update Protocol

Updates protocol configuration.

```rust
pub fn update_protocol(
    ctx: Context<UpdateProtocol>,
    new_fee_bps: Option<u16>,
    new_treasury: Option<Pubkey>,
    paused: Option<bool>,
) -> Result<()>
```

### Service

#### Create Service

Registers a new API provider.

```rust
pub fn create_service(
    ctx: Context<CreateService>,
    name: String,
    default_policy: Pubkey,
) -> Result<()>
```

**Parameters:**
- `name`: Service name (max 64 chars)
- `default_policy`: Default rate limit policy for new API keys

#### Update Service

Updates service configuration.

```rust
pub fn update_service(
    ctx: Context<UpdateService>,
    new_authority: Option<Pubkey>,
    new_default_policy: Option<Pubkey>,
) -> Result<()>
```

#### Set Service Status

Changes service status (Active, Paused, Disabled).

```rust
pub fn set_service_status(
    ctx: Context<SetServiceStatus>,
    new_status: ServiceStatus,
) -> Result<()>
```

### Policy

#### Create Policy

Creates a rate limit policy for a service.

```rust
pub fn create_policy(
    ctx: Context<CreatePolicy>,
    requests_per_window: u64,
    window_seconds: u64,
    burst_limit: u64,
    cost_per_request: u64,
) -> Result<()>
```

**Parameters:**
- `requests_per_window`: Max requests per window
- `window_seconds`: Window duration (≥ 1 second)
- `burst_limit`: Max burst (≤ requests_per_window)
- `cost_per_request`: Cost units per request

#### Update Policy

Updates policy parameters.

```rust
pub fn update_policy(
    ctx: Context<UpdatePolicy>,
    requests_per_window: Option<u64>,
    window_seconds: Option<u64>,
    burst_limit: Option<u64>,
    cost_per_request: Option<u64>,
) -> Result<()>
```

#### Attach Policy to Key

Attaches a policy to an existing API key.

```rust
pub fn attach_policy_to_key(ctx: Context<AttachPolicyToKey>) -> Result<()>
```

### API Key

#### Create API Key

Creates an API key for a consumer.

```rust
pub fn create_api_key(
    ctx: Context<CreateApiKey>,
    policy: Pubkey,
) -> Result<()>
```

**Parameters:**
- `policy`: Rate limit policy (or service default)

#### Revoke API Key

Permanently revokes an API key.

```rust
pub fn revoke_api_key(ctx: Context<RevokeApiKey>) -> Result<()>
```

#### Set API Key Status

Updates API key status (Active, Throttled, Blocked, Revoked).

```rust
pub fn set_api_key_status(
    ctx: Context<SetApiKeyStatus>,
    new_status: ApiKeyStatus,
) -> Result<()>
```

### Delegation

#### Delegate Usage

Delegates usage tracking to an execution region.

```rust
pub fn delegate_usage(
    ctx: Context<DelegateUsage>,
    execution_region: Pubkey,
) -> Result<()>
```

**Parameters:**
- `execution_region`: Execution region (MagicBlock validator) for delegated usage

#### Undelegate Usage

Ends delegation and returns usage state to canonical layer.

```rust
pub fn undelegate_usage(ctx: Context<UndelegateUsage>) -> Result<()>
```

#### Record Usage (Realtime)

Records usage in delegated execution (high-frequency).

```rust
pub fn record_usage_realtime(
    ctx: Context<RecordUsageRealtime>,
    amount: u64,
) -> Result<()>
```

**Parameters:**
- `amount`: Usage units to add (cost_per_request applied by policy)

#### Submit Usage Checkpoint

Submits a window checkpoint to canonical state.

```rust
pub fn submit_usage_checkpoint(ctx: Context<SubmitUsageCheckpoint>) -> Result<()>
```

### Enforcement

#### Evaluate Enforcement

Evaluates current usage against policy and updates API key status.

```rust
pub fn evaluate_enforcement(ctx: Context<EvaluateEnforcement>) -> Result<()>
```

#### Manual Block Key

Manually blocks an API key (overrides enforcement).

```rust
pub fn manual_block_key(ctx: Context<ManualBlockKey>) -> Result<()>
```

#### Manual Unblock Key

Removes manual block from an API key.

```rust
pub fn manual_unblock_key(ctx: Context<ManualUnblockKey>) -> Result<()>
```

### Abuse & Reputation

#### Emit Abuse Signal

Reports abuse for a subject (linked to reputation).

```rust
pub fn emit_abuse_signal(
    ctx: Context<EmitAbuseSignal>,
    severity: u8,
    category: u32,
) -> Result<()>
```

**Parameters:**
- `severity`: 0–10
- `category`: Bitmask (e.g. FLAG_SPAM, FLAG_BOT, FLAG_SUSPICIOUS_BURST, FLAG_MANUAL_BLOCK)

#### Update Reputation

Adjusts reputation score for a subject.

```rust
pub fn update_reputation(
    ctx: Context<UpdateReputation>,
    delta: i64,
) -> Result<()>
```

**Parameters:**
- `delta`: Reputation change (bounded by REPUTATION_MIN/MAX)

## Account Structure

### Protocol State

```rust
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
```

### Rate Limit Policy

```rust
pub struct RateLimitPolicy {
    pub service: Pubkey,
    pub requests_per_window: u64,
    pub window_seconds: u64,
    pub burst_limit: u64,
    pub cost_per_request: u64,
    pub bump: u8,
}
```

### API Key Account

```rust
pub struct ApiKeyAccount {
    pub service: Pubkey,
    pub owner: Pubkey,
    pub policy: Pubkey,
    pub reputation: Pubkey,
    pub status: ApiKeyStatus,
    pub lifetime_usage: u128,
    pub last_checkpoint_ts: i64,
    pub bump: u8,
}
```

### Delegated Usage Account

```rust
pub struct DelegatedUsageAccount {
    pub api_key: Pubkey,
    pub policy: Pubkey,
    pub execution_region: Pubkey,
    pub delegated: bool,
    pub delegation_seq: u64,
    pub window_start_ts: i64,
    pub current_window_usage: u64,
    pub burst_counter: u64,
    pub last_update_ts: i64,
    pub delegated_at: i64,
    pub bump: u8,
}
```

### Reputation Account

```rust
pub struct ReputationAccount {
    pub subject: Pubkey,
    pub global_score: i64,
    pub signal_count: u64,
    pub last_updated_ts: i64,
    pub flags: u32,
    pub bump: u8,
}
```

## PDA Seeds

- Protocol: `["protocol"]`
- Service: `["service", service_count.to_le_bytes()]`
- Policy: `["policy", service.key(), service.total_usage_units.to_le_bytes()]`
- API Key: `["api_key", protocol.api_key_count.to_le_bytes()]`
- Reputation: `["reputation", owner.key()]`
- Delegated Usage: `["delegated_usage", api_key.key()]`
- Abuse Signal: `["abuse_signal", reputation.subject, timestamp]`

## Error Handling

The protocol includes comprehensive error handling:

| Error | Description |
|-------|-------------|
| `Unauthorized` | Signer is not the expected authority |
| `ProtocolPaused` | Protocol operations are paused |
| `InvalidRateLimitConfig` | Invalid policy parameters |
| `ApiKeyBlocked` / `ApiKeyRevoked` | API key cannot be used |
| `AlreadyDelegated` / `NotDelegated` | Invalid delegation state |
| `RateLimitExceeded` / `BurstLimitExceeded` | Policy limits violated |
| `ManualBlockActive` | Manual block prevents status change |
| `ReputationTooLow` | Subject reputation below threshold |

## Testing

### Running Tests

```bash
anchor test
```

### Verified Test Transactions (Devnet)

Proof of successful test execution. Links point to [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet).

#### 01 Protocol

| Test | Transaction |
|------|-------------|
| initializes protocol with valid params | [3afSTr...ZhVc](https://explorer.solana.com/tx/3afSTrDrwdRby3YhBLYE7CeJipS9aKb8YprjanBVWzjzXR1s3y53s7Akh4Lav6EhQ3nkYDSJRnFVmzA3JtUEZhVc?cluster=devnet) |
| updates protocol fee | [3WmCwp...DvXgt](https://explorer.solana.com/tx/3WmCwp5bnUyRiPcncczBcdVPN4tULEKVQKZQSUFAaGdHzQQEUxwtXUgZmSUsoGnCdFj6ueSrCfXWE1rpSrZDvXgt?cluster=devnet) |
| updates protocol treasury | [5aXrHC...sgdEg](https://explorer.solana.com/tx/5aXrHCssEY49A2av1GxtBvwk2wCVcqFky6KpUShxmBGV5uXDD4YLStC8xKXpB4HDnvoPgWEAL13TAdWAXovsgdEg?cluster=devnet) |
| updates protocol paused state | [5BiDgD...SGg62](https://explorer.solana.com/tx/5BiDgDRFEW9xy1aHbq6yWnJpQxe32NZM82XSikMyV4cPRB7J74KTUVUSepXRuG5vRmzAjWcEyTppQL6mKu5SGg62?cluster=devnet) |

#### 02 Service

| Test | Transaction |
|------|-------------|
| creates a service with valid name and default policy | [3Tabo4...Qi4](https://explorer.solana.com/tx/3Tabo47fovNL3baFP2DXeecidMPWsqrPNUEyS7gZh139sYbHnih8vnFGGVoWBaQGJvBzeCsyaxW39n8hkeW6bQi4?cluster=devnet) |
| creates a second service (service_count increments) | [3eogUD...VLR](https://explorer.solana.com/tx/3eogUDbers4uFYWpxmVdSe1iXKGJyXJ5UufgFjzo1j24CR1uUTi43KUE2y9cxcB8B9HW9Dm4PAYE6AjkwrkkmVLR?cluster=devnet) |
| rejects create_service when protocol is paused | [5UNm73...NEq](https://explorer.solana.com/tx/5UNm7345oRSKgQrpodsJe7FLjWAbFygoB2ao7cn7REhTx3wpXHsyPdxZv2AXNZBvBZBdXGy3FHMSwQ4zKS333NEq?cluster=devnet) |
| updates service authority | [46Zu5S...oc3C](https://explorer.solana.com/tx/46Zu5SX6hKYGnZCsctVFE6cFw2UHRnaMb8Goms25uUSi9BhKYvvxhfbbSJdBTHNSLozkJwveojJoWPWp72YEoc3C?cluster=devnet) |
| updates service default policy | [377mF3...b5Ao](https://explorer.solana.com/tx/377mF34CcYUtBEipcY77pZ4aG8dEgSgkYaCi3G9VYWLgpvW9pkr6vgZZKeLyffCCcBZ9FjMvjzEbVtDUb9m8b5Ao?cluster=devnet) |
| set_service_status: Active -> Paused | [4oj2gh...2aWx](https://explorer.solana.com/tx/4oj2gh2VeH4JZn4HGuAeQp7gzbC3ytPw1LvaNoBLg7xAWaZBY6tkCtZW9LFzsEdGtZq2H5HmvTzWUqidzKQ22aWx?cluster=devnet) |
| set_service_status: Paused -> Active | [4MKToZ...fjvp](https://explorer.solana.com/tx/4MKToZqQF6odYRz4Bjp8zb57EWsuitkmTnPysZLLNEMDDcm97zRQBkF5XUBMvYzxQJQjwBefvQFUUoezWATHfjvp?cluster=devnet) |
| set_service_status: Active -> Disabled | [2RC33h...XrLp](https://explorer.solana.com/tx/2RC33hR47LydbeBCYV5JZWHbgu2FD3PpkgRMioS55RUneEoX1mpP94VSQJiNnXtx2kfSR5FL2XdHiZiS21B4XrLp?cluster=devnet) |
| allows status transition Paused -> Disabled on second service | [2Fwrcp...pmK](https://explorer.solana.com/tx/2FwrcpyfayYHHnzmN3Th4KGBZ3bf3Q7NpUoP2ASr72SBdQUXzAfiE5SCnmRzzg1c3N4EjEwpnJYK3ePJFLjdupmK?cluster=devnet) |

#### 03 Policy

| Test | Transaction |
|------|-------------|
| creates a policy with valid params | [2LfYUA...HLSu](https://explorer.solana.com/tx/2LfYUAxKFXYPiXqDSGsu4pKY8RXPV8PWzdchgYQ7oSN8PxynGYzuSHy9cKrrSDU3fPadhadCGrkn3Hd5TkLfHLSu?cluster=devnet) |
| updates policy | [2HTvZL...HBGy](https://explorer.solana.com/tx/2HTvZLopR4qYSCRh52rJ3a4GQrHo7QZ3yR2q3cqT5XLKQhjT9EioCtXdRwZoNobj72grcFQ3DvtdQD1yf4gPHBGy?cluster=devnet) |

#### 04 API Key

| Test | Transaction |
|------|-------------|
| creates an api key with policy | [pm4ujx...B8Y](https://explorer.solana.com/tx/pm4ujxz6KBMpmLr5kfoCavs1yD9Zkfg2Z4PXD17YGeg7Ns6CzvcopJsvbyqrtfgYA3cRjMUFZQv9EuSRwdcCB8Y?cluster=devnet) |
| attach_policy_to_key | [4Mrgbq...bXff](https://explorer.solana.com/tx/4Mrgbqbi7BJ6XMeH87FQWRQst6f1mW3mh4gJXoCGzKoMRKXMAvPNDh4zWBv4EYAC2FsDGMtGdxkLbwCV7rbdbXff?cluster=devnet) |
| set_api_key_status: Active -> Throttled | [Chkrz1...si7A](https://explorer.solana.com/tx/Chkrz1H9xMvNMj8a8Yta8rcfS4nQx9CHwU1RZEhWHPhb1mRui5KSGRQWtTCo9BR674W7MqcwdLek9aAR1mzsi7A?cluster=devnet) |
| set_api_key_status: Throttled -> Active | [36eZWA...hLKW](https://explorer.solana.com/tx/36eZWAhC9jg1ZZWntp4XbXpFftjjPL4rKWMRuwtEaRPMrYMszDzaWsomsn7tprxudNvWeD7KjFNja2tBHPjLhLKW?cluster=devnet) |
| revoke_api_key | [3UAxBM...fo1e](https://explorer.solana.com/tx/3UAxBMjJ13dm26kqbAmWbwSz8cPw89YJ14ojiK139Vewi4q7qjMpqkE5Zi7tv4z3yHProjg4U3JCjsHp8u8Bfo1e?cluster=devnet) |

#### 05 Delegation

| Test | Transaction |
|------|-------------|
| prepare_delegation + delegate_usage on Solana (base layer) | [34mqdp...Rvsg](https://explorer.solana.com/tx/34mqdpdf3LqZigWTtJmPwqghBh4fgv7Wh8ZtjAdLbeNy2g4Vww3uBWnNWNSRHMiXjaKuaY37kWPDFADeRmK3Rvsg?cluster=devnet) |
| record_usage_realtime on ER | [3Ao1yi...Fnz](https://explorer.solana.com/tx/3Ao1yioCRrCHgWuP9Ta6KHUWo2mApArLq7GbcWGji6Kb7e2Kr2F2xVkiMGkzuhnXRQyCCFgRjgry74XJ6cMkoFnz?cluster=custom&customUrl=https%3A%2F%2Fdevnet-as.magicblock.app) |
| submit_usage_checkpoint on ER and confirm on base layer | [2jcaho...WNE](https://explorer.solana.com/tx/2jcahoLdYVaVGAxrEBL5QxPTXqEqDFrsJsSfFZjBkMqeRivPfdpAuqzqiAUVDrGMts8XwtAZxqU8x7X9GH6z7WNE?cluster=custom&customUrl=https%3A%2F%2Fdevnet-as.magicblock.app) |
| undelegate_usage on ER to Solana | [YRgtf5...m7U](https://explorer.solana.com/tx/YRgtf5YCJcUiVaZaVUs4Uxo3XVvenWERnYcU4rG2fsvCUqFBXVAPDHfPpTDCVAFgaLFooBXxqC9FnGBtBTbnm7U?cluster=custom&customUrl=https%3A%2F%2Fdevnet-as.magicblock.app) |

#### 06 Enforcement

| Test | Transaction |
|------|-------------|
| before | [3WfYga...5wG](https://explorer.solana.com/tx/3WfYgaLmGREGFQXxzw9XieiT17DQFDCCjhR8qG7Vd3qboK4F25GoBqGoWrJYKViA7hHZdxQFUimSabc4J4a4u5wG?cluster=devnet) |
| manual_block_key blocks an api key | [38vDaN...UaF](https://explorer.solana.com/tx/38vDaNvHXq16uYevDgFBG14sKSo4HLuUdc1fTsMFwrPk7zUGUKir1639QyGxWzQdtHLa8TUEgFz6Smc2WRjEuUaF?cluster=devnet) |
| manual_unblock_key unblocks an api key | [27EtWH...dniv](https://explorer.solana.com/tx/27EtWHoZEe3JU2EiKPr59o111aGByobkfimwrm1KhFjq9V5mGqNFhoBEfAFrAputQfd5s8GstiCc2WL97HcUdniv?cluster=devnet) |

#### 07 Abuse & Reputation

| Test | Transaction |
|------|-------------|
| emit_abuse_signal creates signal and updates reputation | [2dVNPp...RPU](https://explorer.solana.com/tx/2dVNPpwJBaGQ5sP4gX6bsMQevGHocxeYNBMLSmb29y9PLFZJ9GC98fGdDo2uMdJJAqCVLQpxjW9CinjLpPmhjRPU?cluster=devnet) |
| update_reputation applies delta | [1Ex2oC...iuk](https://explorer.solana.com/tx/1Ex2oCi7oSErzSHeqtr1CJbWCaZLd2U15HWbA11Ej3uoNjjzKgTkPrYnBZ85SA6W86kyqjWkPW4FtXRoTqF7iuk?cluster=devnet) |
| update_reputation clamps to REPUTATION_MAX | [kycwWm...XC1](https://explorer.solana.com/tx/kycwWmsTPv4osKeSiojgy3jeCyFfxSm419f3ycbx8LPJ64Kx546ohY46bUuNotxwWHUAKvPVZUjmZhLtCRFUXC1?cluster=devnet) |

## Security Features

- **PDA Authority**: All accounts use Program Derived Addresses
- **Authority Checks**: Service and protocol operations require correct signer
- **Delegation Lifecycle**: Invariants around delegate/undelegate and checkpoints
- **Reputation Bounds**: REPUTATION_MIN/MAX prevent overflow
- **Manual Block Override**: Explicit manual block/unblock for operator control

## Dependencies

- `anchor-lang` 0.31
- `ephemeral-rollups-sdk` 0.6 (MagicBlock integration)

## License

This project is licensed under the MIT License.

## Development

### Prerequisites

- Rust 1.70+
- Solana CLI 1.16+
- Anchor Framework 0.31+
- Yarn (for tests)

### Building

```bash
anchor build
```

### Deployment

```bash
anchor deploy
```

## Contributing

Contributions are welcome. Please ensure all tests pass and follow the existing code style.

## Disclaimer

This is experimental software. Use at your own risk. Always audit smart contracts before deploying to mainnet.
