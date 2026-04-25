---
order: 37
title: Word Frequencies
slug: python-037
xp_reward: 370
target_time_seconds: 390
---

### Problem Statement
Write `word_frequencies(text)` that counts words case-insensitively.

### Input Format
`text` is a string with space-separated words.

### Output Format
Return dictionary `{word: count}` in lowercase keys.

### Example
`word_frequencies('Hi hi')` -> `{'hi': 2}`

### Constraints
- Use whitespace splitting.

### Initial Code
```python
def word_frequencies(text):
    pass

```

### Test Code
```python
assert word_frequencies('Hi hi there') == {'hi': 2, 'there': 1}
assert word_frequencies('') == {}
```