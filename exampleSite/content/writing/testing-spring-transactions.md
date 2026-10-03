---
title: "Testing Spring transactions without lying to yourself"
date: 2026-05-03
tags: ["spring", "testing", "postgres"]
---

`@Transactional` on a test class rolls everything back at the end — which is convenient, and also means your test never sees a real commit. Deferred constraints, commit hooks and `afterCommit` listeners simply don't run.

The fix is boring: run those tests against a real Postgres, let them commit, and clean up with a truncate between tests.
