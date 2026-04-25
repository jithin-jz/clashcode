---
order: 60
title: Grade Book
slug: python-060
xp_reward: 600
target_time_seconds: 600
---

### Problem Statement
Implement class `GradeBook`.
Methods:
- `add_score(student, score)`
- `student_average(student)` returns average or `None`
- `class_average()` returns overall average or `None`

### Input Format
`student` is a string and `score` is numeric.

### Output Format
Compute per-student and overall averages.

### Example
If no scores exist, average methods return `None`.

### Constraints
- Use floating-point division.

### Initial Code
```python
class GradeBook:
    pass

```

### Test Code
```python
g = GradeBook()
assert g.student_average('Kira') is None
assert g.class_average() is None
g.add_score('Kira', 80)
g.add_score('Kira', 90)
g.add_score('Finn', 70)
assert g.student_average('Kira') == 85
assert g.student_average('Finn') == 70
assert g.class_average() == 80
```