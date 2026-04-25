---
order: 38
title: Anagram Check
slug: python-038
xp_reward: 380
target_time_seconds: 390
---

### Problem Statement
Create `are_anagrams(a, b)`.
Ignore spaces and case.

### Input Format
`a` and `b` are strings.

### Output Format
Return `True` if the cleaned strings are anagrams.

### Example
`are_anagrams('Dormitory', 'Dirty room')` -> `True`

### Constraints
- Compare character counts.

### Initial Code
```python
def are_anagrams(a, b):
    pass

```

### Test Code
```python
assert are_anagrams('Dormitory', 'Dirty room') is True
assert are_anagrams('Listen', 'Silent') is True
assert are_anagrams('Code', 'Coder') is False
```