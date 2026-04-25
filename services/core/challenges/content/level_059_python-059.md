---
order: 59
title: Inventory Manager
slug: python-059
xp_reward: 590
target_time_seconds: 600
---

### Problem Statement
Create class `Inventory` with stock per item name.
Methods:
- `add(item, qty)`
- `remove(item, qty)` (do not go below 0)
- `quantity(item)`

### Input Format
Quantities are non-negative integers.

### Output Format
Maintain stock levels by item name.

### Example
Removing more than available should clamp to 0.

### Constraints
- Unknown items have quantity 0.

### Initial Code
```python
class Inventory:
    pass

```

### Test Code
```python
inv = Inventory()
inv.add('pen', 10)
inv.remove('pen', 3)
assert inv.quantity('pen') == 7
inv.remove('pen', 99)
assert inv.quantity('pen') == 0
assert inv.quantity('book') == 0
```