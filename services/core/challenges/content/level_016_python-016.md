---
order: 16
title: Count Occurrences
slug: python-016
xp_reward: 160
target_time_seconds: 210
---

### Problem Statement
Write `count_occurrences(items, target)` that counts how many times `target` appears.

### Input Format
`items` is a list.

### Output Format
Return occurrence count as integer.

### Example
`count_occurrences([1,2,1], 1)` -> `2`

### Constraints
- Return `0` if target is not present.

### Initial Code
```python
def count_occurrences(items, target):
    pass

```

### Test Code
```python
assert count_occurrences([1, 2, 1, 1], 1) == 3
assert count_occurrences(["a", "b"], "x") == 0
```