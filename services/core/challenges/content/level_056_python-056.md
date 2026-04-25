---
order: 56
title: Stack Class
slug: python-056
xp_reward: 560
target_time_seconds: 600
---

### Problem Statement
Implement class `Stack` with methods:
- `push(item)`
- `pop()` (return `None` if empty)
- `peek()` (return top or `None`)
- `is_empty()`

### Input Format
Use internal list storage.

### Output Format
Return correct stack behavior (LIFO).

### Example
`push(1), push(2), pop()` -> `2`

### Constraints
- Do not raise on empty pop/peek.

### Initial Code
```python
class Stack:
    pass

```

### Test Code
```python
s = Stack()
assert s.is_empty() is True
s.push(10)
s.push(20)
assert s.peek() == 20
assert s.pop() == 20
assert s.pop() == 10
assert s.pop() is None
assert s.is_empty() is True
```