---
order: 50
title: Product With Reduce
slug: python-050
xp_reward: 500
target_time_seconds: 540
---

### Problem Statement
Using `functools.reduce`, implement `product(nums)`.

### Input Format
`nums` is a list of integers.

### Output Format
Return the multiplicative product of all values.

### Example
`product([2,3,4])` -> `24`

### Constraints
- Empty list should return `1`.

### Initial Code
```python
from functools import reduce


def product(nums):
    pass

```

### Test Code
```python
assert product([2, 3, 4]) == 24
assert product([5]) == 5
assert product([]) == 1
```