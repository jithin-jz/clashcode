---
order: 34
title: Rotate Left
slug: python-034
xp_reward: 340
target_time_seconds: 360
---

### Problem Statement
Implement `rotate_left(items, k)` to rotate a list left by `k` steps.

### Input Format
`items` is a list, `k` is an integer.

### Output Format
Return a new rotated list.

### Example
`rotate_left([1,2,3,4], 1)` -> `[2,3,4,1]`

### Constraints
- Support `k` larger than list length.

### Initial Code
```python
def rotate_left(items, k):
    pass

```

### Test Code
```python
assert rotate_left([1, 2, 3, 4], 1) == [2, 3, 4, 1]
assert rotate_left([1, 2, 3, 4], 5) == [2, 3, 4, 1]
assert rotate_left([], 3) == []
```