---
order: 26
title: Divisors
slug: python-026
xp_reward: 260
target_time_seconds: 300
---

### Problem Statement
Write `divisors(n)` that returns all positive divisors of `n` in ascending order.

### Input Format
`n` is an integer and `n > 0`.

### Output Format
Return list of divisors.

### Example
`divisors(12)` -> `[1,2,3,4,6,12]`

### Constraints
- Include `1` and `n`.

### Initial Code
```python
def divisors(n):
    pass

```

### Test Code
```python
assert divisors(1) == [1]
assert divisors(12) == [1, 2, 3, 4, 6, 12]
assert divisors(13) == [1, 13]
```