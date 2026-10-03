---
title: "Kotlin value classes for money: a field report"
date: 2025-11-18
tags: ["kotlin", "ledgers"]
---

Wrapping amounts in a value class costs nothing at runtime and catches a whole category of bugs at compile time: you can no longer add an `AccountId` to an amount by accident.

```kotlin
@JvmInline
value class MinorUnits(val value: Long) {
    operator fun plus(other: MinorUnits) = MinorUnits(Math.addExact(value, other.value))
}
```
