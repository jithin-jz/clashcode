---
order: 15
title: Reverse Copy
slug: python-015
xp_reward: 150
target_time_seconds: 210
---

### Problem Statement
Create `reverse_copy(items)` that returns a new reversed list.

### Input Format
`items` is a list.

### Output Format
Return reversed list.

### Example
`reverse_copy([1, 2, 3])` -> `[3, 2, 1]`

### Constraints
- Do not mutate the input list.

### Initial Code
```python
def reverse_copy(items):
    pass

```

### Test Code
```python
src = [1, 2, 3]
out = reverse_copy(src)
assert out == [3, 2, 1]
assert src == [1, 2, 3]
```