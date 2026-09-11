# Ccentrik

Two independent applications connected through a controlled integration layer.
See [`docs/requirements/02-two-application-architecture.md`](docs/requirements/02-two-application-architecture.md)
and [`03-recruitment-hr-integration.md`](docs/requirements/03-recruitment-hr-integration.md)
for the full architecture and integration contract.

```
apps/
  recruitment/   Application 1 — Candidate + Talent Acquisition (this repo)
  hr/             Application 2 — HR. Its OWN git repository:
                  https://github.com/ccentrikhrapp/onboardingapp
                  (kept on disk here too, at apps/hr/, purely for convenience
                  while developing both side by side — this repo does not
                  track it; see apps/hr/'s own README there)
```

Each app has its own `package.json`, its own Supabase project (own database,
auth, storage, edge functions), and its own env vars. Neither app imports code
from the other or talks to the other's database directly — see the
integration contract for how they communicate (shared-secret edge function
calls only).

## Getting started

```bash
npm install                 # installs the recruitment app's dependencies
npm run recruitment         # starts the Candidate/TA app (apps/recruitment)
```

For the HR app, clone it separately and follow its own README:
`git clone https://github.com/ccentrikhrapp/onboardingapp.git apps/hr`.

See [`apps/recruitment/docs/BACKEND_SETUP.md`](apps/recruitment/docs/BACKEND_SETUP.md)
for the recruitment app's Supabase setup, and the shared
[`docs/requirements/`](docs/requirements/) at the repo root for the product spec.

## Requirements

Product/behavioural specs (source of truth):

- [`docs/requirements/00-master-development-prompt.md`](docs/requirements/00-master-development-prompt.md)
- [`docs/requirements/01-pre-offer-document-verification.md`](docs/requirements/01-pre-offer-document-verification.md)
- [`docs/requirements/02-two-application-architecture.md`](docs/requirements/02-two-application-architecture.md)
