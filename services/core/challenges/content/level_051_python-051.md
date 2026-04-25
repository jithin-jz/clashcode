---
order: 51
title: Click Counter Class
slug: python-051
xp_reward: 510
target_time_seconds: 540
---

### Problem Statement
Create class `ClickCounter` with:
- `value` attribute (starts at 0)
- `increment(step=1)` method
- `reset()` method

### Input Format
Instantiate `ClickCounter()` with no args.

### Output Format
`increment` returns new value. `reset` sets value back to 0.

### Example
`c.increment()` -> `1`

### Constraints
- Keep state in `self.value`.

### Initial Code
```python
class ClickCounter:
    pass

```

### Test Code
```python
c = ClickCounter()
assert c.value == 0
assert c.increment() == 1
assert c.increment(4) == 5
c.reset()
assert c.value == 0
```