---
order: 45
title: Adjacent Sums
slug: python-045
xp_reward: 450
target_time_seconds: 450
---

### Problem Statement
Use `itertools.pairwise` to build `adjacent_sums(nums)`.
Return sums of each adjacent pair.

### Input Format
`nums` is a list of integers.

### Output Format
Return list of integers.

### Example
`adjacent_sums([1,2,3,4])` -> `[3,5,7]`

### Constraints
- For fewer than 2 items, return empty list.

### Initial Code
```python
from itertools import pairwise


def adjacent_sums(nums):
    pass

```

### Test Code
```python
assert adjacent_sums([1, 2, 3, 4]) == [3, 5, 7]
assert adjacent_sums([5]) == []
assert adjacent_sums([]) == []
```