---
order: 43
title: Rotate Queue
slug: python-043
xp_reward: 430
target_time_seconds: 450
---

### Problem Statement
Use `collections.deque` in `rotate_queue(items, steps)`.
Rotate right by `steps` and return a list.

### Input Format
`items` is a list, `steps` is an integer.

### Output Format
Return rotated list.

### Example
`rotate_queue([1,2,3],1)` -> `[3,1,2]`

### Constraints
- Handle empty list safely.

### Initial Code
```python
from collections import deque


def rotate_queue(items, steps):
    pass

```

### Test Code
```python
assert rotate_queue([1, 2, 3], 1) == [3, 1, 2]
assert rotate_queue([1, 2, 3], 4) == [3, 1, 2]
assert rotate_queue([], 2) == []
```