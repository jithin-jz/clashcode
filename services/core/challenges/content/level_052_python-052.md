---
order: 52
title: Bank Account
slug: python-052
xp_reward: 520
target_time_seconds: 540
---

### Problem Statement
Implement class `BankAccount` with starting `balance=0`.
Methods:
- `deposit(amount)` adds and returns new balance
- `withdraw(amount)` subtracts when possible and returns `True`, else `False`

### Input Format
`BankAccount(balance=0)`

### Output Format
Maintain valid account balance.

### Example
`withdraw` should fail when amount exceeds balance.

### Constraints
- Balance must not go below 0.

### Initial Code
```python
class BankAccount:
    def __init__(self, balance=0):
        self.balance = balance

```

### Test Code
```python
acct = BankAccount(100)
assert acct.deposit(50) == 150
assert acct.withdraw(25) is True
assert acct.balance == 125
assert acct.withdraw(500) is False
assert acct.balance == 125
```