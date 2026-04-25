---
order: 40
title: Merge Sorted Lists
slug: python-040
xp_reward: 400
target_time_seconds: 420
---

### Problem Statement
Write `merge_sorted(left, right)` that merges two already-sorted lists.

### Input Format
`left` and `right` are sorted integer lists.

### Output Format
Return one sorted list containing all values.

### Example
`merge_sorted([1,3],[2,4])` -> `[1,2,3,4]`

### Constraints
- Keep duplicates.

### Initial Code
```python
def merge_sorted(left, right):
    pass

```

### Test Code
```python
assert merge_sorted([1, 3], [2, 4]) == [1, 2, 3, 4]
assert merge_sorted([], [1, 2]) == [1, 2]
assert merge_sorted([1, 2], []) == [1, 2]
```