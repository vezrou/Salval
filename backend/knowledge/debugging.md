# Debugging Knowledge — Salma

## The Debugging Mindset
Understand what the code is TRYING to do before judging what it is DOING wrong.
Read the intent, then find the gap between intent and reality.

## Common Bug Patterns

### Off-By-One Errors
- Loop bounds: `< len` vs `<= len`, `range(n)` vs `range(1, n+1)`
- Slice indices: `arr[0:n]` vs `arr[0:n+1]`
- Always ask: is the boundary inclusive or exclusive?

### Null / None Dereference
- Before accessing any property or calling any method on a value,
  ask: can this ever be null/None/undefined?
- Check at the entry point, not scattered throughout the code.

### Unhandled Exceptions
- Every call that can fail (network, file I/O, parsing, DB) needs error handling.
- Don't swallow exceptions with empty `except` / `catch` blocks.
- Log the error with enough context to reproduce it.

### Infinite Loops
- Every loop needs a guaranteed exit condition.
- Every recursive function needs a base case that is always reachable.
- Loop variables must be updated on every iteration.

### Scope / Closure Bugs
- Variables captured in closures reflect their value AT CALL TIME, not definition time.
- Watch for loop variables captured in async callbacks (classic JS bug).

### Type Mismatches
- Comparing across types with loose equality (`==` in JS) causes silent bugs.
- Always use strict equality (`===` in JS). In Python, be explicit about type coercion.

### Race Conditions
- Async operations that depend on each other must be properly awaited/chained.
- Don't assume order of execution without explicit synchronisation.

---

## Debugging Process
1. Reproduce the bug reliably before touching the code.
2. Form a hypothesis about the cause.
3. Test the hypothesis with the smallest possible change.
4. Confirm the fix does not break anything else.
5. Document what caused it and how you fixed it.

---

## Add Your Research Below
<!-- Paste notes, debugging techniques, and language-specific patterns here. -->
