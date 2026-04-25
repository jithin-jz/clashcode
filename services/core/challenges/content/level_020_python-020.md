---
order: 20
title: Flatten One Level
slug: python-020
xp_reward: 200
target_time_seconds: 240
---

### Problem Statement
Write `flatten_once(rows)` to flatten a 2D list by one level.

### Input Format
`rows` is a list of lists.

### Output Format
Return a single flat list.

### Example
`flatten_once([[1,2],[3]])` -> `[1,2,3]`

### Constraints
- Only flatten one nesting level.

### Initial Code
```python
def flatten_once(rows):
    pass

```

### Test Code
```python
assert flatten_once([[1, 2], [3]]) == [1, 2, 3]
assert flatten_once([[], [4, 5]]) == [4, 5]
```