---
order: 48
title: Sorted JSON Keys
slug: python-048
xp_reward: 480
target_time_seconds: 480
---

### Problem Statement
Using `json`, write `sorted_json_keys(raw_json)` for a top-level JSON object.

### Input Format
`raw_json` is a JSON string representing an object.

### Output Format
Return sorted list of top-level keys.

### Example
`sorted_json_keys('{"b":2,"a":1}')` -> `['a','b']`

### Constraints
- Keys should be returned in ascending order.

### Initial Code
```python
import json


def sorted_json_keys(raw_json):
    pass

```

### Test Code
```python
assert sorted_json_keys('{"b":2,"a":1}') == ['a', 'b']
assert sorted_json_keys('{"x":1}') == ['x']
```