---
title: "Idempotent Kafka consumers without a distributed lock"
date: 2026-09-21
tags: ["kafka", "kotlin", "reliability"]
description: "A dedupe table, a unique constraint and one transaction boundary — and why that beat every clever locking scheme we tried."
---

Kafka gives you at-least-once delivery. Your consumer has to turn that into exactly-once *effects*. The trick is to make "have I seen this?" and "apply it" the same database transaction.

## The dedupe table

```sql
create table processed_event (
  event_id   uuid primary key,
  processed  timestamptz not null default now()
);
```

## One transaction, two writes

```kotlin
fun handle(event: PaymentEvent) = db.transaction {
    val fresh = processed.insertIgnore(event.id) // on conflict do nothing
    if (!fresh) return@transaction               // duplicate: skip quietly
    ledger.apply(event)
}
```

If the consumer crashes after commit but before the offset is stored, the redelivered message hits the primary key and is skipped. No lock, no coordinator — just a constraint doing what constraints do.
