---
name: clean-modular-code
description: Removes AI-generated slop and produces minimal, modular code that matches project conventions. Use when writing, editing, or reviewing code; refactoring; fixing AI-generated diffs; or when the user mentions slop, over-engineering, boilerplate, verbose comments, or clean modular code.
---

# Clean Modular Code

Write code that looks like a senior engineer on this team wrote it — not a generic LLM output.

## Core Principles

1. **Smallest correct diff** — change only what the task requires
2. **Match the codebase** — read surrounding files first; copy naming, structure, and abstractions
3. **Modular, not abstract** — split by responsibility; avoid frameworks-for-frameworks-sake
4. **Self-explanatory code** — comments only for non-obvious business logic or sharp edges

## Workflow

### Phase 1: Read Before Write

1. Find 2–3 similar files in the repo (same layer, same feature area)
2. Note: file layout, import style, error handling, naming, test patterns
3. Reuse existing helpers, hooks, components, services — do not reimplement

### Phase 2: Plan the Shape

Before editing, decide:

- **Single file enough?** Prefer extending existing modules over new files
- **Where does logic live?** Follow project layering (e.g. routers → services → models)
- **What's the public surface?** One clear entry point; keep internals private

### Phase 3: Implement

- One function/component = one job
- Prefer composition over inheritance
- Pass data explicitly; avoid hidden globals and magic config
- Handle real failure modes the project already handles; skip speculative guards

### Phase 4: Slop Pass (mandatory before finishing)

Run the checklist below on every change. Delete or rewrite anything that fails.

## Slop Checklist

**Scope & structure**
- [ ] No files, exports, or features beyond what was asked
- [ ] No duplicate logic that already exists elsewhere
- [ ] No new abstraction used only once

**Comments & docs**
- [ ] No comments restating what the code obviously does
- [ ] No file-header summaries, change logs, or "This function..." docblocks on trivial helpers
- [ ] No TODO/FIXME unless the user requested tracked follow-ups

**Code smell**
- [ ] No wrapper functions that only call one other function
- [ ] No try/catch around code that cannot fail in this context
- [ ] No `any`, unchecked casts, or `@ts-ignore` to silence problems
- [ ] No debug logging or print statements left behind

**Style**
- [ ] Naming matches nearby code (length, casing, prefixes)
- [ ] No emoji in code, comments, or log messages
- [ ] Imports grouped and ordered like sibling files

**Responses**
- [ ] Explanations proportional to change size — no essay for a 5-line fix
- [ ] No engagement bait ("Let me know if…", "Happy to help…")

For expanded slop patterns and before/after examples, see [references/slop-patterns.md](references/slop-patterns.md).

## Modular Code Patterns

### Good decomposition

```
# Layered (backend)
router  → parse HTTP, auth headers, status codes
service → business rules, orchestration
model/db → persistence shape

# Frontend
page     → route + layout
hook     → server state / side effects
component → presentation; props in, events out
```

### When to extract

| Extract when | Keep inline when |
|---|---|
| Used 2+ times with same semantics | Used once |
| Logic is >~15 lines and testable alone | Few lines, clear in context |
| Hides non-obvious domain rules | Straightforward glue code |

### Function design

- **Inputs**: explicit parameters; avoid option bags with 10 fields
- **Outputs**: return values or typed errors the project already uses — not ad hoc `{ success, data, error }` wrappers unless that's the pattern
- **Side effects**: isolate I/O at boundaries; keep pure logic testable

## Anti-Patterns (reject on sight)

| Slop | Do instead |
|---|---|
| `HelperUtilsManager` class | Named function in the module that owns the concern |
| Config object for 2 flags | Inline constants or existing env pattern |
| Generic `processData(input)` | Domain-named function: `buildAccessRequestPayload` |
| Copy-paste from another repo | Adapt to this repo's types and layers |
| Defensive defaults for impossible nulls | Trust types/contracts; guard only at real boundaries |

## Examples

### Example: Feature request
User says: "Add a filter by domain on the catalog page"

**Do**: Extend existing catalog hook + filter state; reuse `Select`/`Checkbox` from ui; match `ProductService.list` query params.

**Don't**: New `FilterManager` context, generic filter engine, or 200-line refactor of unrelated files.

### Example: Slop cleanup
User says: "This AI diff feels bloated — clean it up"

**Do**: Read diff, delete dead code and redundant comments, inline one-use helpers, align naming with neighbors, keep behavior identical.

**Don't**: Rewrite the whole module or add a "refactored" architecture.

### Example: New endpoint
User says: "Add GET /api/products/:id/stats"

**Do**: Router thin handler → `ProductService.get_stats()` → existing DB session pattern; Pydantic model aligned with frontend types.

**Don't**: New repository layer, caching layer, and response wrapper if the project doesn't use them elsewhere.


