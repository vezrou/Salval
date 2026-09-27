# Coding Knowledge — Leo

## Code Quality Fundamentals

### Function Design
- One function = one job. Max ~20 lines as a soft guide.
- Parameters: more than 3 is a signal to use an object/dict instead.
- Return early — avoid deeply nested conditionals with guard clauses:
  ```python
  # Instead of:
  if user:
      if user.active:
          if user.has_permission:
              do_thing()

  # Use:
  if not user: return
  if not user.active: return
  if not user.has_permission: return
  do_thing()
  ```

### Naming
- Functions: verb + noun (`get_user`, `validate_email`, `send_notification`)
- Variables: noun or adjective + noun (`user_id`, `is_valid`, `filtered_results`)
- No single-letter names except loop counters (`i`, `j`) and coordinates (`x`, `y`)

### Code Review Checklist
- Does every function have a single clear responsibility?
- Are all edge cases handled? (empty input, null, zero, negative numbers)
- Is there any duplicated logic that should be extracted?
- Are names honest about what the code does?
- Are there any performance concerns? (N+1 queries, unnecessary loops)

---

## Common Patterns

### Guard Clauses
Validate inputs at the top of a function and return early.
Keeps the happy path unindented and easy to follow.

### Strategy Pattern
Replace long if/elif or switch chains with a dictionary of functions.
```python
handlers = {
    "create": handle_create,
    "update": handle_update,
    "delete": handle_delete,
}
handler = handlers.get(action)
if handler:
    handler(payload)
```

### Pure Functions
Functions that take inputs and return outputs with no side effects are:
- Easy to test
- Easy to reason about
- Safe to reuse anywhere

Separate pure computation from side effects (I/O, DB calls, logging).

---

## API Design
- Use nouns for resource URLs, verbs for actions: `/users` not `/getUsers`
- HTTP methods carry meaning: GET (read), POST (create), PUT/PATCH (update), DELETE (remove)
- Return consistent error shapes: `{ "error": "message", "code": "ERROR_CODE" }`
- Always validate request input before processing

---

## Add Your Research Below
<!-- Paste language-specific patterns, algorithms, and best practices here. -->
