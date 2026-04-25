---
order: 53
title: Student Counter
slug: python-053
xp_reward: 530
target_time_seconds: 570
---

### Problem Statement
Create class `Student` with class variable `student_count`.
Increase it every time a new student is created.
Also implement `label()` returning `"<name> (Grade <grade>)"`.

### Input Format
Constructor: `Student(name, grade)`.

### Output Format
Track instances and return formatted labels.

### Example
`Student('Kira', 10).label()` -> `'Kira (Grade 10)'`

### Constraints
- `student_count` belongs to the class, not instances.

### Initial Code
```python
class Student:
    pass

```

### Test Code
```python
Student.student_count = 0
s1 = Student('Kira', 10)
s2 = Student('Finn', 11)
assert Student.student_count == 2
assert s1.label() == 'Kira (Grade 10)'
assert s2.label() == 'Finn (Grade 11)'
```