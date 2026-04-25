---
order: 57
title: Temperature Model
slug: python-057
xp_reward: 570
target_time_seconds: 600
---

### Problem Statement
Create class `Temperature` storing Celsius in `self.celsius`.
Methods:
- `to_fahrenheit()`
- classmethod `from_fahrenheit(f)` returning a `Temperature` instance

### Input Format
Constructor: `Temperature(celsius)`.

### Output Format
Convert between scales accurately.

### Example
`Temperature.from_fahrenheit(212).celsius` -> `100`

### Constraints
- Keep formulas consistent.

### Initial Code
```python
class Temperature:
    pass

```

### Test Code
```python
t = Temperature(100)
assert t.to_fahrenheit() == 212
cold = Temperature.from_fahrenheit(32)
assert isinstance(cold, Temperature)
assert cold.celsius == 0
```