---
order: 54
title: Rectangle Class
slug: python-054
xp_reward: 540
target_time_seconds: 570
---

### Problem Statement
Build class `Rectangle(width, height)` with methods `area()` and `perimeter()`.

### Input Format
Constructor takes `width` and `height`.

### Output Format
Return computed geometry values.

### Example
`Rectangle(3,4).area()` -> `12`

### Constraints
- Use instance attributes.

### Initial Code
```python
class Rectangle:
    pass

```

### Test Code
```python
r = Rectangle(3, 4)
assert r.area() == 12
assert r.perimeter() == 14
```