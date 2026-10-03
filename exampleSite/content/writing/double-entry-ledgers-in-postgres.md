---
title: "Double-entry ledgers in Postgres, one constraint at a time"
date: 2026-08-30
tags: ["postgres", "ledgers", "kotlin"]
description: "Moving ledger invariants out of application code and into the database, where they can't be forgotten."
toc: true
---

Every ledger bug I've seen started the same way: a balance column that someone, somewhere, updated directly. Here's how we moved the invariants out of application code and into the database, where they can't be forgotten.

## The one rule

Double-entry has a single invariant: for every transaction, debits equal credits. Everything else — balances, statements, [reconciliation](#what-we-gave-up) — is derived from that. So the schema starts with postings, not balances.

```sql {title="V12__postings.sql"}
create table posting (
  id             bigint generated always as identity primary key,
  transaction_id uuid    not null,
  account_id     uuid    not null references account(id),
  amount_minor   bigint  not null check (amount_minor <> 0),
  currency       char(3) not null
);
```

Signed amounts keep the arithmetic honest: debits are positive, credits negative, and a transaction is balanced when its postings sum to zero.

## Enforcing balance at commit

A row-level check can't see its siblings. A deferred constraint trigger can — it runs right before commit, after every posting of the transaction is in place.

```sql
-- fires once per row, but only at commit time
create constraint trigger posting_balanced
  after insert on posting
  deferrable initially deferred
  for each row execute function assert_balanced();
```

> If an invariant only lives in application code, it's a suggestion.

On the Kotlin side this leaves `LedgerService` with very little to do: open a transaction, insert the postings, commit. If anything is off, Postgres refuses with a clear error — and nothing half-written survives.

```kotlin {title="LedgerService.kt" hl_lines=[4]}
fun post(tx: LedgerTransaction) = db.transaction {
    tx.postings.forEach { postings.insert(it) }
    // assert_balanced() runs here, at commit
    log.info("posted {}", tx.id)
}
```

## What we gave up

Deferred triggers run on every commit, so bulk imports get slower. For our volumes the trade was obvious; your mileage — and your batch sizes — may vary.

| Approach              | Enforced by | Survives a hotfix script? |
| --------------------- | ----------- | ------------------------- |
| Service-layer check   | Kotlin      | No                        |
| Row `check` constraint| Postgres    | Partly                    |
| Deferred trigger      | Postgres    | Yes                       |
