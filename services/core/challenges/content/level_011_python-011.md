---
order: 11
title: First Item
slug: python-011
xp_reward: 110
target_time_seconds: 180
---

### Problem Statement
Create `first_item(items)` that returns the first list element.
Return `None` when the list is empty.

### Input Format
`items` is a list.

### Output Format
Return first value or `None`.

### Example
`first_item([4, 5, 6])` -> `4`

### Constraints
- Do not modify the list.

### Initial Code
```python
def first_item(items):
    pass

```

### Test Code
```python
assert first_item([4, 5, 6]) == 4
assert first_item(["a"]) == "a"
assert first_item([]) is None
```