---
order: 30
title: Pair Sum Exists
slug: python-030
xp_reward: 300
target_time_seconds: 330
---

### Problem Statement
Write `has_pair_sum(nums, target)`.
Return whether any two different indices add up to `target`.

### Input Format
`nums` is a list of integers.

### Output Format
Return boolean.

### Example
`has_pair_sum([1,4,6], 10)` -> `True`

### Constraints
- Use each element at most once per pair.

### Initial Code
```python
def has_pair_sum(nums, target):
    pass

```

### Test Code
```python
assert has_pair_sum([1, 4, 6], 10) is True
assert has_pair_sum([2, 7, 11, 15], 9) is True
assert has_pair_sum([3, 3], 7) is False
```