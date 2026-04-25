---
order: 25
title: Count Vowels
slug: python-025
xp_reward: 250
target_time_seconds: 270
---

### Problem Statement
Create `count_vowels(text)` that counts vowels in a string.

### Input Format
`text` is a string.

### Output Format
Return count of `a,e,i,o,u` ignoring case.

### Example
`count_vowels('Code')` -> `2`

### Constraints
- Only English vowels.

### Initial Code
```python
def count_vowels(text):
    pass

```

### Test Code
```python
assert count_vowels('Code') == 2
assert count_vowels('PYTHON') == 1
assert count_vowels('rhythm') == 0
```