# PowerMem Live Memory Lifecycle Lab

This is a live PowerMem laboratory, not a precomputed presentation. It follows
one real memory through decay, reinforcement, and promotion.

## Flow

The fixed memory is:

```text
Atlas 项目的支付请求必须携带幂等键；重复请求直接返回首次处理结果。
```

The fixed comparison query is:

```text
Atlas 如何避免支付重试造成重复扣款？
```

1. Reset clears the fixed demo scope and leaves the experiment empty.
2. The user clicks **写入这条记忆**. `POST /api/add` executes a real
   `Memory.add(infer=False)`, then establishes a source-consistent deterministic
   starting state: `importance=0.5`, `memory_type=working`, and
   `initial_retention=current_retention=0.5`, `access_count=0`. The 50% value is
   the importance-weighted initial strength produced by PowerMem, not elapsed
   time decay.
3. Advancing 24 hours changes only the retention time anchor and makes the next
   access eligible for review. Access count, review history, and tier remain
   unchanged. The event shows the actual source calculation
   `R_after = R_before × exp(-t / S)`, where
   `t=hours_elapsed/24` days and `S=decay_rate` days.
4. Search executes a real PowerMem hybrid RRF query with `limit=1`.
5. A search hit automatically runs PowerMem's `on_search → on_get` feedback
   path. There is no separate user “adopt memory” action.
6. The first due hit reinforces retention. A second identical search shows that
   the previous reinforcement is now part of the retrieval-time snapshot. The
   reinforcement event shows
   `R_new = R_now + alpha × (1 - R_now)` and the new persisted
   `current_retention` snapshot.
7. Search hits 1–3 update `access_count` without changing the tier.
8. Hit 4 promotes `working → short_term`; hit 5 promotes
   `short_term → long_term`.
9. Advancing another 24 hours preserves the long-term tier and counters, making
   the slower decay visible before the final due search reinforces the memory
   again.

The UI presents effective retention, access count, review count, persisted
`memory_type`, and `next_review` as the primary signals. `next_review` is shown
as an access-triggered reinforcement gate, not a background timer. Ordinary
hits that occur before that time also show how the updated `access_count`
changes the next effective decay time scale. Raw RRF and `final_score` values
remain in an optional technical-details disclosure because they are relative
ranking scores, not confidence percentages.

## Scope

```text
collection = memories_decay_demo
user       = demo-atlas-user
agent      = demo-memory-agent
run        = atlas-memory-lifecycle-demo
```

## Deploy

On `testmind-dev`:

```bash
docker compose \
  --env-file /root/powermem/docker/.env \
  up -d --build
```

The container joins the existing `powermem-network`, uses the same model
configuration as PowerMem, and exposes the demo on port 80.

## Verify

```bash
curl http://127.0.0.1/healthz
docker compose ps
docker compose logs -f
```
