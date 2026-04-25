---
order: 27
title: Clean Palindrome
slug: python-027
xp_reward: 270
target_time_seconds: 300
---

### Problem Statement
Implement `is_clean_palindrome(text)`.
Ignore spaces and case while checking palindrome.

### Input Format
`text` is a string.

### Output Format
Return `True` if palindrome, else `False`.

### Example
`is_clean_palindrome('Never odd or even')` -> `True`

### Constraints
- Remove spaces before comparing.

### Initial Code
```python
def is_clean_palindrome(text):
    pass

```

### Test Code
```python
assert is_clean_palindrome('Never odd or even') is True
assert is_clean_palindrome('racecar') is True
assert is_clean_palindrome('python') is False
```