---
order: 31
title: Operation Router
slug: python-031
xp_reward: 310
target_time_seconds: 330
---

### Problem Statement
Implement `operate(a, b, op)` for operators `+`, `-`, `*`, `/`.

### Input Format
`a` and `b` are numbers, `op` is a string.

### Output Format
Return computed numeric result.

### Example
`operate(8, 2, '/')` -> `4`

### Constraints
- Raise `ValueError` for unsupported operators.

### Initial Code
```python
def operate(a, b, op):
    pass

```

### Test Code
```python
assert operate(5, 3, '+') == 8
assert operate(5, 3, '-') == 2
assert operate(5, 3, '*') == 15
assert operate(8, 2, '/') == 4
try:
    operate(1, 2, '%')
    raise AssertionError('Expected ValueError')
except ValueError:
    pass
```