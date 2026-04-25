---
order: 47
title: Days Between Dates
slug: python-047
xp_reward: 470
target_time_seconds: 480
---

### Problem Statement
Using `datetime`, implement `days_between(start_date, end_date)`.
Dates are in `YYYY-MM-DD` format.

### Input Format
`start_date` and `end_date` are date strings.

### Output Format
Return absolute number of days between them.

### Example
`days_between('2026-01-01', '2026-01-10')` -> `9`

### Constraints
- Use calendar-accurate date math.

### Initial Code
```python
from datetime import datetime


def days_between(start_date, end_date):
    pass

```

### Test Code
```python
assert days_between('2026-01-01', '2026-01-10') == 9
assert days_between('2024-02-28', '2024-03-01') == 2
assert days_between('2026-01-10', '2026-01-01') == 9
```