# Test plan: WholeCart 1.0 marketplace release

| | |
|---|---|
| **Objective** | Decide whether the marketplace release is ready for restaurants across the city |
| **Test basis** | WC-FDD-1.0-89d9, WC-RN-1.0-89d9 (wins where they differ), OpenAPI 3.1 spec, live screens |
| **Environment** | Private copy, base path `/c/tejas-113cc1`. Browser: _<name/version>_. Build/version shown in app: _<value>_ |
| **Accounts** | Buyers: buyer1 (Spice Route Kitchen), buyer2 (Café Dosa Corner), buyer3 (शर्मा भोजनालय). Sellers: seller1 (WholeCart Direct), seller2 (FreshFarm Foods), seller3 (Coastal Beverages). Operator: operator. Password `Test@123` |
| **Effort** | ~7.5 hours over two days, one tester |

## 1. Scope

**New in this release (FDD §1):** third-party sellers, cancellation, slot change, redelivery, refunds and exchanges, invoices, statements, inquiries, seller screens, CSV import, partner API, logistics export. Change requests CR-07 and CR-09.

**Existing features (regression, FDD §1):** buyer login, catalogue, cart, checkout and order history for WholeCart Direct products, operator settings.

**Interfaces:** web screens, REST API (Bearer token), partner API (`X-Api-Key`), CSV import, logistics export, `/api/metrics`.

**Out of scope:**
- Cross-browser and mobile layouts: one tester and ~7.5 hours; all UI testing on one desktop browser.
- Hosting infrastructure and security attacks: excluded by the brief; testing only through the web screens, API and partner API.

## 2. Approach

| Activity | What and how | Tools |
|---|---|---|
| Requirements review | Each rule checked for boundaries, timing, permissions, concurrency, unstated cases and conflicts with screens, mockups, API and release notes. Gaps go to the questions log as a question plus working assumption | Questions log |
| Exploratory testing | _<charters / time boxes>_ | Browser + DevTools |
| Scripted functional | Test cases derived from the rules and assumptions; boundary values for limits (e.g. quantity, minimum order, cancellation window), state transitions for order status | Test specification |
| API testing | Priority-area rules checked directly through the API, including role access for buyer, seller and operator | curl / Postman, browser DevTools |
| Automation | Regression subset: login and role access (buyer, seller, operator); checkout with tax, delivery fee and minimum order; cancellation inside and outside the window. Runs with one command | Playwright (TypeScript), API and UI in one runner |
| Load | NF-01 and NF-02 targets, capped below 50 req/s (NF-03) | k6 (arrival-rate executor), `/api/metrics` |

**Prioritisation (highest first):**
1. Money: tax, delivery fee, invoices, refunds (BR-07, BR-08, BR-18, BR-19, BR-22, CR-07, CR-09)
2. Time rules: slots, same-day cut-off, cancellation window, store clock (BR-05, BR-06, BR-11, BR-15, BR-24)
3. Data access between buyers and sellers (BR-21, partner API)
4. Stock and orders: overselling, cancellation, status flow (BR-01, BR-02, BR-11 to BR-14)

Lower-priority areas get exploratory coverage only; gaps are recorded in the coverage matrix.

## 3. Entry criteria

- Test environment reachable at `/c/tejas-113cc1`; web screens, API docs and `/api/metrics` respond
- All seven test accounts can log in with their documented role
- Functional design, release notes and API reference available (CR-09 scan to be read on the live site)

## 4. Exit criteria

- All P1 test cases executed
- No open Critical defects
- Each open High defect has its release risk stated in the results report
- Load test run against the NF-01 and NF-02 targets

## 5. Defect severity

| Severity | Definition |
|---|---|
| Critical | Blocks a core flow or causes loss of money, stock or data, or exposes another customer's data; no workaround |
| High | Business rule broken or major function wrong; workaround is difficult or not acceptable for release |
| Medium | Function partly wrong; reasonable workaround exists |
| Low | Cosmetic, wording or minor usability issue |

## 6. Risks

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-01 | Store clock changes (BR-24) affect every time-based test and can leave later tests running at the wrong time | High | High | Time-based tests run one at a time; each test records the clock it sets and resets it afterwards |
| R-02 | Limited time (~7.5 h, one tester): low-priority areas get thin coverage | High | Medium | Risk-based priority order above; untested areas marked in the coverage matrix and named as open risks in the results report |

## 7. Deliverables

Questions and assumptions log, this plan, scenarios and matrix, test specification, defect log with evidence, automation (one command), load test, results report, screen recording.
