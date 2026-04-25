---
order: 58
title: Todo List
slug: python-058
xp_reward: 580
target_time_seconds: 600
---

### Problem Statement
Implement class `TodoList` managing internal task dictionaries with shape `{'title': str, 'done': bool}`.
Methods:
- `add_task(title)`
- `complete_task(index)`
- `pending_tasks()` returns titles not done

### Input Format
Use zero-based indices.

### Output Format
Return/update todo state correctly.

### Example
After completing one task, `pending_tasks()` excludes it.

### Constraints
- Ignore invalid complete indices (do nothing).

### Initial Code
```python
class TodoList:
    pass

```

### Test Code
```python
todo = TodoList()
todo.add_task('Read')
todo.add_task('Practice')
assert todo.pending_tasks() == ['Read', 'Practice']
todo.complete_task(0)
assert todo.pending_tasks() == ['Practice']
todo.complete_task(99)
assert todo.pending_tasks() == ['Practice']
```