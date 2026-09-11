# Ccentrik

Two independent applications connected through a controlled integration layer.
See [`docs/requirements/02-two-application-architecture.md`](docs/requirements/02-two-application-architecture.md)
for the full architecture and integration contract.

```
apps/
  recruitment/   Application 1 — Candidate + Talent Acquisition
  hr/             Application 2 — HR (onboarding onward)
```

Each app has its own `package.json`, its own Supabase project (own database,
auth, storage, edge functions), its own env vars, and its own README with
setup steps. Neither app imports code from the other or talks to the other's
database directly — see the integration contract for how they communicate.

This is an npm-workspaces monorepo purely for local convenience (one
`npm install` hoists both apps' dependencies). Nothing assumes a shared repo —
either app folder can be extracted into its own git repository later without
code changes.

## Getting started

```bash
npm install                 # installs both apps' dependencies
npm run recruitment         # starts the Candidate/TA app (apps/recruitment)
npm run hr                  # starts the HR app (apps/hr)
```

See each app's README for its own scripts, tests and backend setup
(`apps/recruitment/docs` and `apps/hr/docs` — or the shared
[`docs/requirements/`](docs/requirements/) at the repo root for the product spec).

## Requirements

Product/behavioural specs (source of truth):

- [`docs/requirements/00-master-development-prompt.md`](docs/requirements/00-master-development-prompt.md)
- [`docs/requirements/01-pre-offer-document-verification.md`](docs/requirements/01-pre-offer-document-verification.md)
- [`docs/requirements/02-two-application-architecture.md`](docs/requirements/02-two-application-architecture.md)
