---
order: 19
title: Index Words
slug: python-019
xp_reward: 190
target_time_seconds: 240
---

### Problem Statement
Implement `index_words(words)` that maps each word to its first index.

### Input Format
`words` is a list of strings.

### Output Format
Return dictionary `{word: first_index}`.

### Example
`index_words(['a','b','a'])` -> `{'a':0,'b':1}`

### Constraints
- Keep first occurrence index.

### Initial Code
```python
def index_words(words):
    pass

```

### Test Code
```python
assert index_words(['a', 'b', 'a']) == {'a': 0, 'b': 1}
assert index_words([]) == {}
```