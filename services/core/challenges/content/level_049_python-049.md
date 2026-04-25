---
order: 49
title: Extract Integers
slug: python-049
xp_reward: 490
target_time_seconds: 540
---

### Problem Statement
Use `re` in `extract_integers(text)` to find all signed integers in order.

### Input Format
`text` is a string.

### Output Format
Return list of integers.

### Example
`extract_integers('x=-3 y=20')` -> `[-3, 20]`

### Constraints
- Include negative values.

### Initial Code
```python
import re


def extract_integers(text):
    pass

```

### Test Code
```python
assert extract_integers('x=-3 y=20') == [-3, 20]
assert extract_integers('no numbers') == []
assert extract_integers('7 8 -9') == [7, 8, -9]
```