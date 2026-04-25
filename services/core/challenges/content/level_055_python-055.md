---
order: 55
title: Inheritance Override
slug: python-055
xp_reward: 550
target_time_seconds: 570
---

### Problem Statement
Create base class `Vehicle` with method `move()` returning `'Vehicle moving'`.
Create class `Car(Vehicle)` overriding `move()` to return `'Car driving'`.

### Input Format
No constructor arguments required.

### Output Format
Demonstrate method overriding.

### Example
`Car().move()` -> `'Car driving'`

### Constraints
- `Car` must inherit from `Vehicle`.

### Initial Code
```python
class Vehicle:
    pass


class Car(Vehicle):
    pass

```

### Test Code
```python
v = Vehicle()
c = Car()
assert v.move() == 'Vehicle moving'
assert c.move() == 'Car driving'
assert isinstance(c, Vehicle)
```