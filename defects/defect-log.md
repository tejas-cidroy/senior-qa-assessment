# Defect log: WholeCart 1.0 marketplace release

**Environment (applies to every defect unless stated):** base URL `http://13.200.185.1/c/tejas-113cc1` · browser _<name/version>_ · app build _<value>_ · tester _<name>_
**Severity:** as defined in the test plan §5 (Critical / High / Medium / Low)
**Evidence:** files in `defects/evidence/`, named `DEF-xx_<n>_<short>.png|json|txt`. API evidence is the full request (method, URL, body; token removed) and response (status, body).

## Summary

| ID | Title | Severity | Area | Requirement | Found by (TC / exploratory) | Status |
|---|---|---|---|---|---|---|
| DEF-01 | | | | | | Open |

### Defects by severity

| Critical | High | Medium | Low | Total |
|---|---|---|---|---|
| | | | | |

---

## DEF-01: <what is wrong, where, in one line>

| Field | Value |
|---|---|
| Severity | |
| Requirement | BR- / IF- / NF- / CR- (and Q-xx if the expectation relies on an assumption) |
| Found by | TC-xx / exploratory charter |
| Account(s) | |
| Store clock | Real time / fixed to _<date time>_ |
| Date and time found | |
| Reproducible | Always / n of m attempts |
| Status | Open |

**Preconditions**

**Test data**

**Steps to reproduce**
1.
2.

**Expected result** (with rule reference)

**Actual result**

**Evidence**
- `evidence/DEF-01_1_<short>.png`
- Request / response:

```http
POST /c/tejas-113cc1/api/...
Content-Type: application/json

{ }
```

```http
HTTP/1.1 200
{ }
```

**Impact / release risk**

**Notes** (workaround, related defects, assumption that would change this)
