---
order: 36
title: Running Total
slug: python-036
xp_reward: 360
target_time_seconds: 390
---

### Problem Statement
Implement `running_total(nums)`.
Each result element should be the cumulative sum up to that index.

### Input Format
`nums` is a list of integers.

### Output Format
Return list of cumulative sums.

### Example
`running_total([2,3,5])` -> `[2,5,10]`

### Constraints
- Empty list returns empty list.

### Initial Code
```python
def running_total(nums):
    pass

```

### Test Code
```python
assert running_total([2, 3, 5]) == [2, 5, 10]
assert running_total([]) == []
assert running_total([1, -1, 4]) == [1, 0, 4]
```