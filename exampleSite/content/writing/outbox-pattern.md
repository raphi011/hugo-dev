---
title: "The outbox pattern, the boring way"
date: 2025-09-02
tags: ["kafka", "postgres"]
---

Write the event to an `outbox` table in the same transaction as the state change, and let a separate relay publish it. That's the whole pattern — everything else is tuning.
