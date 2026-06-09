# AI Slop Patterns — Reference

Concrete patterns to detect and remove. When in doubt: if a teammate would ask "why did you add this?", delete it.

## Comment slop

```python
# BAD — narrates the obvious
# Loop through products and filter by domain
for product in products:
    if product.domain == domain:
        result.append(product)

# GOOD — no comment needed
for product in products:
    if product.domain == domain:
        result.append(product)

# GOOD — comment explains non-obvious rule
# UC OBO hides products the caller lacks SELECT on; empty list is valid.
return self._repo.list_visible(session, user_token)
```

```typescript
// BAD
/**
 * Fetches products from the API
 * @param domain - the domain to filter by
 * @returns array of products
 */
// GOOD — types and name carry this; JSDoc only if public API with subtle contract
```

## Over-abstraction slop

```python
# BAD — factory for one implementation
class ProductRepositoryFactory:
    @staticmethod
    def create(kind: str) -> ProductRepository:
        if kind == "mock":
            return MockProductRepository()
        return MockProductRepository()

# GOOD — match project: direct service + existing data module
from server.data.mock_products import MOCK_PRODUCTS
```

```typescript
// BAD — context + provider + hook trio for local boolean
const FilterContext = createContext(...)
export function FilterProvider({ children }) { ... }
export function useFilterContext() { ... }

// GOOD — useState in the page or existing filter hook pattern
const [domain, setDomain] = useState<Domain | null>(null)
```

## Defensive slop

```python
# BAD — catches and re-raises generically everywhere
try:
    product = get_product(id)
except Exception as e:
    logger.error(f"Error getting product: {e}")
    raise

# GOOD — let unexpected errors propagate; handle known cases at boundary
product = get_product(id)
if product is None:
    raise HTTPException(status_code=404, detail="Product not found")
```

## Scope creep slop

Signs you went beyond the ask:

- Renamed unrelated variables "for consistency"
- Added validation the API layer doesn't use elsewhere
- Introduced env flags for behavior nobody requested
- Wrote tests for unchanged code
- Reformatted whole files (imports, quote style) outside touched lines

**Fix**: Revert unrelated hunks; keep the minimal behavioral change.

## Naming slop

| Slop | Better |
|---|---|
| `handleClickEvent` | `onSubmit` (if that's the project convention) |
| `data` / `item` / `result` | `product`, `request`, `accessToken` |
| `Utils`, `Helpers`, `Manager` | Verb or domain noun: `parseToken`, `ProductService` |
| `isValid === true` | `isValid` |

## Response slop (when explaining changes)

**Avoid**
- Bullet lists of every line changed
- Restating the user's request back at length
- "I've successfully implemented…" / "Here's what I did:" for tiny diffs
- Offering five follow-up options unprompted

**Prefer**
- One sentence on what changed and why
- Call out only non-obvious tradeoffs
- Link to code with citations when useful

## Modular without slop

**Good module boundaries**
- `product_service.py`: list, get, search — no HTTP types
- `products.py` router: query params, headers, `Response` status
- `useProducts.ts`: React Query key, fetch, cache invalidation
- `ProductCard.tsx`: display props; no fetch

**Bad "modular"**
- Splitting a 20-line function across 4 files
- Interface + impl when only one impl exists and no test doubles needed
- Shared `constants.ts` with one constant
- `types/` file duplicating generated OpenAPI types

## Review pass script

Apply in order:

1. **Delete** — unused imports, dead branches, duplicate helpers, narrating comments
2. **Inline** — functions called once with no test value
3. **Align** — names, types, error shapes with neighbors
4. **Verify** — behavior unchanged; diff is the smallest that satisfies the task
