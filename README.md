# WholeCart 1.0 marketplace: QA

Test deliverables and automation for the WholeCart 1.0 marketplace release.

## Repository layout

| Path | Contents |
|---|---|
| `docs/` | Questions log, test plan, scenarios and matrix, test specification (`04`), results report (`05`); `openapi.json` and the CR-09 scan |
| `defects/` | `defect-log.md`; `evidence/` holds screenshots and request/response captures |
| `src/` | API client (`api/client.ts`), config and accounts, money helpers |
| `tests/api/` | API tests |
| `tests/ui/` | UI tests |
| `load/` | k6 script; `README.md` has requirements, plan, results and conclusion; raw output in `results/` |
| `scripts/` | `capture-responses.ts`: read-only capture of real response shapes |
| `samples/` | Captured responses |
| `ai-sessions/` | Exported AI chat and agent sessions |

## Setup

Requires Node.js 20+ and, for the load test, [k6](https://k6.io/docs/get-started/installation/).

```bash
npm install
npx playwright install chromium
```

The target defaults to `http://13.200.185.1/c/tejas-113cc1`. Override it with:

```bash
export WC_BASE_URL=http://<host>/c/<id>
```

## Running

| Command | What it does |
|---|---|
| `npm test` | All API and UI tests (regression); one command |
| `npm run test:api` | API tests only |
| `npm run test:ui` | UI tests only |
| `npm run report` | Open the HTML report from the last run |
| `npm run load` | k6 load test (stays below 50 req/s) |
| `npm run capture` | Read-only capture of API responses into `samples/` |

Tests run with one worker: they share one environment, one store clock (BR-24) and limited slot capacity (BR-05).
