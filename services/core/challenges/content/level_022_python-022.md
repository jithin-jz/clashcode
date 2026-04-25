---
order: 22
title: Grade Band
slug: python-022
xp_reward: 220
target_time_seconds: 240
---

### Problem Statement
Implement `grade_from_score(score)` using:
A: 90-100, B: 80-89, C: 70-79, D: 60-69, F: below 60.

### Input Format
`score` is an integer 0..100.

### Output Format
Return one letter grade.

### Example
`grade_from_score(84)` -> `'B'`

### Constraints
- Return uppercase letters only.

### Initial Code
```python
def grade_from_score(score):
    pass

```

### Test Code
```python
assert grade_from_score(97) == 'A'
assert grade_from_score(84) == 'B'
assert grade_from_score(72) == 'C'
assert grade_from_score(61) == 'D'
assert grade_from_score(12) == 'F'
```