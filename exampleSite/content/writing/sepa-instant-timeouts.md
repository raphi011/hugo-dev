---
title: "What SEPA Instant taught us about timeouts"
date: 2026-07-12
tags: ["payments", "sepa", "reliability"]
---

SEPA Instant has a hard end-to-end deadline measured in seconds. That one number changes how you think about every hop between your API and the clearing system.

## Budgets, not timeouts

Instead of giving every call its own timeout, we pass a deadline down the chain and let each step spend what's left of it. A step that can't finish in the remaining budget fails fast — which is far better than finishing late.

```kotlin
suspend fun <T> withinBudget(deadline: Instant, block: suspend () -> T): T =
    withTimeout(Duration.between(Instant.now(), deadline).toMillis()) { block() }
```

The hardest part wasn't the code. It was agreeing what "late" means when the money may already have moved.
