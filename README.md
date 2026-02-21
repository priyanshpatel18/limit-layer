# Architecture

## How this works in Web2

Traditional rate limiting and abuse detection are implemented as private backend infrastructure owned by each service.

Typical architecture:

- API gateway receives requests
- Gateway queries a centralized datastore such as Redis
- Counters are incremented per key
- Policies are evaluated
- Gateway decides allow, throttle, or block
- Separate systems compute reputation or abuse signals
- Billing systems later aggregate usage logs

Core components in Web2:

- API key registry database
- Realtime counter store (Redis, Memcached)
- Rate limit evaluation service
- Abuse detection pipelines
- Usage metering / billing service
- Internal admin tools

Characteristics:

- Counters are siloed per company
- Reputation does not travel across services
- Enforcement logic is not verifiable
- Billing requires trust in internal logs
- Horizontal scaling complexity is high
- Realtime correctness depends on cache consistency
- Multi service coordination is extremely difficult

Failure modes:

- Counter desync
- Race conditions
- Lost usage events
- Abuse signal fragmentation
- Complex reconciliation jobs

In Web2, rate limiting is treated as an internal state problem owned by one backend.

---

## How this works on Solana

This protocol moves the control plane of rate limiting and abuse detection into a shared deterministic state machine.

Core shift:

- Identity, policy, and enforcement state live on chain
- Realtime usage is processed via delegated execution
- Deterministic checkpoints update canonical state
- Enforcement decisions are derived from canonical state

Architecture layers:

Canonical Layer (Solana program)

- Service registry
- API key identity
- Rate limit policy definitions
- Usage checkpoints
- Reputation state
- Enforcement status

Realtime Layer (delegated execution / MagicBlock)

- High frequency counters
- Sliding window tracking
- Burst detection
- Temporary usage state
- Deterministic checkpoint production

Flow:

1. Service creates API keys and policies on chain
2. Usage state is delegated to an execution region
3. Execution region processes realtime usage events
4. Periodic checkpoints are submitted on chain
5. Program updates canonical aggregates
6. Enforcement status is derived deterministically
7. Reputation signals can be shared across services

Conceptual mapping:

- Redis counters → delegated usage accounts
- Batch usage jobs → checkpoints
- Internal enforcement service → program reducer
- Abuse pipelines → on chain signals
- Billing aggregation → deterministic usage checkpoints

Key architectural property:

The chain becomes the authoritative control plane, while realtime execution acts as a high frequency extension rather than the source of truth.

---

## Tradeoffs & Constraints

### Latency vs Finality

- Realtime enforcement occurs in delegated execution
- Canonical correctness only exists after checkpoint
- There is a window where realtime state is optimistic

Tradeoff: faster enforcement vs strict finality.

---

### Write Throughput Limits

Even with delegation, canonical updates are bounded by:

- Transaction throughput
- Account write limits
- Checkpoint frequency design

This requires batching and window modeling.

---

### State Modeling Complexity

Rate limiting requires:

- Sliding windows
- Burst semantics
- Monotonic counters
- Deterministic reconciliation

Modeling these safely on chain is more complex than Web2 cache counters.

---

### Delegation Safety

Delegation introduces new risks:

- Incorrect execution region behavior
- Missing checkpoints
- Partial reconciliation

The protocol must enforce strong invariants around undelegation and checkpoint submission.

---

### Storage Costs

On chain state must be minimized.

Implications:

- Cannot store raw events
- Must store aggregates only
- Checkpoint design is critical
- Reputation modeling must be compact

---

### Deterministic Enforcement Constraints

All enforcement decisions must be deterministic.

This restricts:

- Heuristic based ML detection
- Non deterministic signals
- External dependency reliance

Complex detection must be reduced into deterministic signals.

---

### Operational Complexity

Services must integrate:

- Delegation lifecycle
- Checkpoint submission
- Policy migration flows
- Enforcement evaluation

This is more operationally complex than a single Redis based system.

---

### Economic Considerations

Costs exist for:

- Account storage
- Checkpoints
- Reputation updates

This introduces explicit infrastructure costs that are implicit in Web2.

---

### Benefits vs Traditional Backend

Despite constraints, the architecture enables:

- Shared abuse intelligence across services
- Portable API identity and reputation
- Verifiable usage billing
- Neutral enforcement layer between services and consumers
- Deterministic replay of usage state
- Composable infrastructure primitives

The protocol reframes rate limiting from a private backend feature into a shared infrastructure layer.