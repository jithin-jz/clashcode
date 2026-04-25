---
order: 44
title: GCD And LCM
slug: python-044
xp_reward: 440
target_time_seconds: 450
---

### Problem Statement
Using `math.gcd`, implement `gcd_lcm(a, b)` returning `(gcd, lcm)`.

### Input Format
`a` and `b` are positive integers.

### Output Format
Return tuple `(gcd, lcm)`.

### Example
`gcd_lcm(12, 18)` -> `(6, 36)`

### Constraints
- LCM formula: `(a*b)//gcd`.

### Initial Code
```python
import math


def gcd_lcm(a, b):
    pass

```

### Test Code
```python
assert gcd_lcm(12, 18) == (6, 36)
assert gcd_lcm(7, 5) == (1, 35)
```