---
order: 18
title: Merge Scoreboards
slug: python-018
xp_reward: 180
target_time_seconds: 210
---

### Problem Statement
Build `merge_scoreboards(left, right)`.
Both are dictionaries with integer values. Sum values for matching keys.

### Input Format
`left` and `right` are dictionaries of `{str: int}`.

### Output Format
Return merged dictionary.

### Example
`{'a':2} + {'a':3,'b':1}` -> `{'a':5,'b':1}`

### Constraints
- Include all keys from both dictionaries.

### Initial Code
```python
def merge_scoreboards(left, right):
    pass

```

### Test Code
```python
assert merge_scoreboards({'a': 2}, {'a': 3, 'b': 1}) == {'a': 5, 'b': 1}
assert merge_scoreboards({}, {'x': 4}) == {'x': 4}
```