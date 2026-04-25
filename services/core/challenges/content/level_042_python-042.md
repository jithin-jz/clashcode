---
order: 42
title: Group By First Letter
slug: python-042
xp_reward: 420
target_time_seconds: 420
---

### Problem Statement
Using `collections.defaultdict`, implement `group_by_first_letter(words)`.
Group words by their lowercase first character.

### Input Format
`words` is a list of non-empty strings.

### Output Format
Return dictionary of `{first_letter: [words...]}` in original order.

### Example
`group_by_first_letter(['Apple','ant'])” -> `{'a':['Apple','ant']}`

### Constraints
- Keep input order within each group.

### Initial Code
```python
from collections import defaultdict


def group_by_first_letter(words):
    pass

```

### Test Code
```python
assert group_by_first_letter(['Apple', 'ant', 'Boat']) == {'a': ['Apple', 'ant'], 'b': ['Boat']}
assert group_by_first_letter([]) == {}
```