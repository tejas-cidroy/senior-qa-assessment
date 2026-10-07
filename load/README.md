# Load test: WholeCart 1.0

## 1. Load requirements

| ID | Requirement | Source | Measured as | Pass if |
|---|---|---|---|---|
| LR-01 | Order submission under 30 concurrent buyers | NF-01 | p95 of `POST /api/orders` | p95 ≤ 3 s |
| LR-02 | Search response time | NF-02 | p95 of `GET /api/products?q=` | p95 ≤ 2 s |
| LR-03 | Our own load stays within the limit | NF-03 | total req/s (k6 `http_reqs` rate) | < 50 req/s; no 429 below it |
| LR-04 | _<correctness under load, e.g. errors, stock, duplicates>_ | | | |

## 2. Plan

| Item | Decision |
|---|---|
| Scenarios and load shape | |
| Concurrency model for 30 buyers (only 3 buyer accounts exist) | |
| Test data and setup (stock, slot capacity per BR-05, settings) | |
| Restore after run | |
| Duration and ramp | |
| Rate budget per scenario (sum < 50 req/s) | |
| Monitoring (`/api/metrics` before / after) | |
| Assumptions (Q-IDs) | |

## 3. Script

`checkout-search.js`. Run: `npm run load` or `k6 run --summary-export=load/results/summary.json load/checkout-search.js`

## 4. Results

Run date / time: · Store clock: · Build:

| Requirement | Target | Measured | Result |
|---|---|---|---|
| LR-01 | p95 ≤ 3 s | | |
| LR-02 | p95 ≤ 2 s | | |
| LR-03 | < 50 req/s | | |

`/api/metrics` before / after: _<key figures>_
Raw output: `results/`

## 5. Conclusion

_<Met / not met, what limits the result, and what it means for release>_
