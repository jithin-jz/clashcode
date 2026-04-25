---
order: 41
title: Most Common Character
slug: python-041
xp_reward: 410
target_time_seconds: 420
---

### Problem Statement
Use `collections.Counter` in `most_common_char(text)` to find the most frequent non-space character.
If tied, return the lexicographically smallest character.

### Input Format
`text` is a string.

### Output Format
Return a single character. Return `None` if no non-space characters exist.

### Example
`most_common_char('aab bb')` -> `'b'`

### Constraints
- Ignore spaces.

### Initial Code
```python
from collections import Counter


def most_common_char(text):
    pass

```

### Test Code
```python
assert most_common_char('aab bb') == 'b'
assert most_common_char('ccbb') == 'b'
assert most_common_char('   ') is None
```