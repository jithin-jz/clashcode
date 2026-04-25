---
order: 12
title: Last Item
slug: python-012
xp_reward: 120
target_time_seconds: 180
---

### Problem Statement
Implement `last_item(items)`.
Return `None` when empty.

### Input Format
`items` is a list.

### Output Format
Return final element or `None`.

### Example
`last_item([1, 2, 3])` -> `3`

### Constraints
- Use index-based access.

### Initial Code
```python
def last_item(items):
    pass

```

### Test Code
```python
assert last_item([1, 2, 3]) == 3
assert last_item(["z"]) == "z"
assert last_item([]) is None
```