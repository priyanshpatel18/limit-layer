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
LiLyRHkivstck1s3E58W6pcUobaEz2iAtcNZFXuAQu7
```

- [Solana Explorer (Devnet)](https://explorer.solana.com/address/LiLyRHkivstck1s3E58W6pcUobaEz2iAtcNZFXuAQu7?cluster=devnet)

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

Test results will be added as the test suite is expanded.

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
