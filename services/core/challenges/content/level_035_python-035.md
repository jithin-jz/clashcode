---
order: 35
title: Chunk List
slug: python-035
xp_reward: 350
target_time_seconds: 360
---

### Problem Statement
Create `chunk_list(items, size)` that splits items into chunks of length `size`.

### Input Format
`items` is a list and `size > 0`.

### Output Format
Return list of chunk lists.

### Example
`chunk_list([1,2,3,4,5],2)` -> `[[1,2],[3,4],[5]]`

### Constraints
- Keep original order.

### Initial Code
```python
def chunk_list(items, size):
    pass

```

### Test Code
```python
assert chunk_list([1, 2, 3, 4, 5], 2) == [[1, 2], [3, 4], [5]]
assert chunk_list([], 3) == []
```