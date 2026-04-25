---
order: 32
title: Safe Divide
slug: python-032
xp_reward: 320
target_time_seconds: 330
---

### Problem Statement
Create `safe_divide(a, b, default=None)`.
Return `a / b` unless `b == 0`, then return `default`.

### Input Format
`a` and `b` are numbers.

### Output Format
Return quotient or default value.

### Example
`safe_divide(10, 0, -1)` -> `-1`

### Constraints
- Do not raise division errors.

### Initial Code
```python
def safe_divide(a, b, default=None):
    pass

```

### Test Code
```python
assert safe_divide(10, 2) == 5
assert safe_divide(10, 0) is None
assert safe_divide(10, 0, -1) == -1
```