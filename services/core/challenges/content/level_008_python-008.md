---
order: 8
title: Normalize Username
slug: python-008
xp_reward: 80
target_time_seconds: 150
---

### Problem Statement
Create `normalize_username(name)` that trims spaces and lowercases the value.

### Input Format
`name` is a string.

### Output Format
Return normalized username.

### Example
`normalize_username("  Kira_01  ")` -> `"kira_01"`

### Constraints
- Use string methods only.

### Initial Code
```python
def normalize_username(name):
    pass

```

### Test Code
```python
assert normalize_username("  Kira_01  ") == "kira_01"
assert normalize_username("USER") == "user"
```