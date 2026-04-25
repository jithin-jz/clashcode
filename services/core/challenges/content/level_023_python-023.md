---
order: 23
title: Leap Year
slug: python-023
xp_reward: 230
target_time_seconds: 270
---

### Problem Statement
Write `is_leap_year(year)`.
A year is leap if divisible by 4, except centuries unless divisible by 400.

### Input Format
`year` is an integer.

### Output Format
Return `True`/`False`.

### Example
`is_leap_year(2000)` -> `True`

### Constraints
- Implement full Gregorian rule.

### Initial Code
```python
def is_leap_year(year):
    pass

```

### Test Code
```python
assert is_leap_year(2000) is True
assert is_leap_year(1900) is False
assert is_leap_year(2024) is True
assert is_leap_year(2023) is False
```