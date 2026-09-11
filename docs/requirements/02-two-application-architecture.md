# Two-Application Architecture — Recruitment/TA vs HR

> Supplied by the product owner on 2026-09-11. This **overrides the single-app
> assumption** in [`00-master-development-prompt.md`](./00-master-development-prompt.md):
> Candidate/TA and HR are no longer one product. This file is authoritative on
> application boundaries; `00-*` and `01-*` still govern workflow behaviour
> *within* each application.

## 1. Core principle

Two independent applications, each with its own frontend, backend, business
logic, permissions and (ideally) database/deployment — connected only through a
**secure, controlled, API-based integration layer**. Never merge them because
they exchange data; never let one backend query the other's database directly.

```
RECRUITMENT SYSTEM (Candidate + TA)          HR SYSTEM
  Frontend -> Backend -> Recruitment DB        Frontend -> Backend -> HR DB
                    \                              /
                     \--------- Integration ------/
                           (events, APIs, audit)
```

## 2. Application 1 — Candidate + TA (Recruitment)

Owns the recruitment lifecycle: jobs, applications, screening, interviews,
selection, offers, offer acceptance. Candidate and TA are two roles inside this
one application. Candidate never touches the HR backend directly.

## 3. Application 2 — HR

A completely separate product. Owns everything from onboarding onward: employee
management, onboarding, documents/forms, department/designation, attendance,
leave, payroll, compensation, employee lifecycle, offboarding. Built and
deployed independently; its modules are implemented on their own schedule, not
forced to match recruitment's.

## 4. The boundary — where ownership changes hands

```
CANDIDATE -> APPLICATION -> SCREENING -> INTERVIEWS -> SELECTION -> OFFER
-> OFFER ACCEPTED
======================== HR HANDOFF ========================
-> ONBOARDING -> DOCUMENTS -> FORMS -> JOINING -> EMPLOYEE -> LIFECYCLE
```

`OFFER_ACCEPTED` is the single integration trigger point from recruitment to HR.

**Candidate ≠ Employee.** Accepting an offer makes the person an *Onboarding
Candidate / Pre-Employee* inside HR — never auto-converted to a full employee.
Only HR completing onboarding + joining formalities creates the Employee record.

## 5. Source of truth (no dual ownership)

- **Recruitment owns:** candidate, application, job, requisition, recruitment
  stage, interview, interview feedback, selection, rejection, offer, offer status.
- **HR owns:** employee, employee ID, joining, employment record, department/
  designation assignment, employee documents, HR forms, attendance, leave,
  payroll, compensation, employment lifecycle, exit.

If HR needs candidate data it gets a controlled copy via the integration layer,
never a live query into the recruitment DB (and vice versa for HR data TA might
need, e.g. joining confirmation).

## 6. Integration contract

**Forward events (Recruitment -> HR)**, one per accepted offer:

```json
{
  "event": "OFFER_ACCEPTED",
  "event_id": "uuid",                 // idempotency key
  "candidate_id": "...", "application_id": "...", "offer_id": "...",
  "timestamp": "...",
  "candidate": { "name": "...", "email": "...", "phone": "..." },
  "position": { "job_id": "...", "job_title": "...", "department": "...", "designation": "..." },
  "offer": { "offer_date": "...", "joining_date": "...", "employment_type": "...", "location": "..." }
}
```

**Reverse events (HR -> Recruitment)**, status-only, never confidential HR data:
`ONBOARDING_STARTED`, `DOCUMENTS_PENDING`, `DOCUMENTS_COMPLETED`,
`JOINING_CONFIRMED`, `JOINING_CANCELLED`, `EMPLOYEE_CREATED`.

TA's dashboard may show `Offer Accepted -> HR Handoff Initiated/Completed ->
Onboarding In Progress -> Joining Confirmed` — never payroll, bank details,
leave, attendance, or compensation.

### Processing rules (HR receiving an event)

1. Authenticate the source system (service credential, not a user session).
2. Validate payload shape + required ids.
3. Verify the offer is actually `accepted` (defence in depth, don't just trust the event).
4. Idempotency: dedupe on `event_id` (and `offer_id`) — a repeat delivery must
   not create a second onboarding case.
5. Create the onboarding case as `Pre-Employee`, referencing the original
   candidate/application/offer ids (reference, not a copy of everything).
6. Make it visible on the HR dashboard as "New Onboarding".

### Failure handling

Every outbound attempt is logged with a status
(`PENDING|PROCESSING|SUCCESS|FAILED|RETRYING|CANCELLED`), a retry count and a
timestamp. A failed delivery is retried, never silently dropped, and is visible
for manual retry/monitoring. "Sent" is not "received" — recruitment waits for
an explicit RECEIVED (and ideally PROCESSED) acknowledgement from HR.

### Documents

Never blindly duplicate every candidate document into HR. Only what onboarding
actually needs crosses over, as a secure reference (or a controlled copy) with
metadata + verification status — not raw storage access into the recruitment
bucket.

## 7. Security

Service-to-service auth (a shared secret / signed request) between the two
backends — never end-user tokens, never direct DB access, never an exposed
internal database. Least-privilege: HR's integration endpoint accepts only the
offer-acceptance shape it needs; recruitment's reverse-status endpoint accepts
only the status enum, nothing else.

## 8. Repository / deployment approach (engineering decision, 2026-09-11)

True separate git repos would be the purest form of "two applications," but
provisioning a second GitHub repo and a second cloud project both require the
user's own action outside this session. The pragmatic equivalent implemented
here: a **monorepo with two independently deployable apps**, each with its own
`package.json`, own build, own Supabase project (own database, own auth, own
storage, own edge functions), own env vars, and no shared runtime code path:

```
apps/
  recruitment/   <- Application 1 (Candidate + TA). Existing app, HR removed.
  hr/            <- Application 2. New app, seeded from the existing HR UI.
```

Splitting `apps/hr` out into its own git repository later is a plain
`git subtree`/copy — nothing in the code assumes a shared repo. This satisfies
independent frontends/backends/logic/permissions; only the source-control
container is shared for now.

## 9. Development order (per the product owner's sequencing)

1. Finish Application 1 (recruitment) — jobs/applications/interviews/offers/
   acceptance — largely underway per `00-*`/`01-*`.
2. Build Application 2 (HR) independently — onboarding, documents, forms,
   joining, employee, lifecycle.
3. Define the integration contract (this document + the schema/endpoints below).
4. Connect both systems (`OFFER_ACCEPTED` -> HR onboarding case; reverse status
   events back to recruitment).
5. Test the full journey plus failure modes: API failure, duplicate events,
   invalid candidate/offer, offer rejection/withdrawal, joining cancellation,
   missing documents, retry, partial data, unauthorized API access.

This session performs the **application split** and lays the **integration
scaffold** (contract, tables, stub endpoints) now, ahead of full HR feature
work, so later phases land in the right application from the start.
