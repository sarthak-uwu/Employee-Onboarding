# Pre-Offer Document Verification — Final Business Requirement

> Supplied by the product owner on 2026-09-10. Belongs to **Phase 4**. Extends
> [`00-master-development-prompt.md`](./00-master-development-prompt.md) §16–17.

## 1. Purpose & position in the workflow

Before TA can send an offer letter, the candidate must complete the **Pre-Offer
Document Submission** process and HR must verify it. This stage is a **mandatory gate
between Candidate Selection and Offer Letter**:

```
Application → TA Review → TA Approval → Interview Process
→ All Required Interview Rounds Completed → Candidate Selected / Advanced
→ PRE-OFFER DOCUMENT VERIFICATION → HR Verification → Documents Cleared → Offer Letter
```

The offer letter must NOT become available to TA until pre-offer verification conditions
are satisfied. Backend-enforced — never rely only on disabling the frontend button.

Stages must stay separate: `PRE-OFFER DOCUMENTS → OFFER LETTER → HR ONBOARDING
DOCUMENTS/FORMS`. Do not mix pre-offer documents with later onboarding documents.

## 2. Requirement classes

- **Mandatory** — candidate is expected to provide it.
  PAN Card; Aadhaar (Front & Back); Passport; 10th Certificate; 12th Certificate;
  Degree Certificate / Semester-wise Mark Sheets; 2 Passport-Size Photographs.
- **Required** — part of the checklist, should normally be submitted.
  Latest 3-Month Payslips; Offer Letters (previous employers); Relieving Letters
  (previous employers); Current & Permanent Address Proof; Appointment Letters
  (previous employers); Cancelled Cheque; Last Three Employment Details.
- **Conditional** — only where the candidate has the relevant document/info; must NOT
  block a candidate for a genuinely non-applicable conditional document.
  Increment Letter (if any); Current / Existing Offer Letter (if any).

## 3. The 16-item checklist

| # | Document | Class | Notes |
|---|----------|-------|-------|
| 1 | PAN Card | Mandatory | qty 1, HR verify |
| 2 | Aadhaar Card — Front & Back | Mandatory | one requirement, both sides required, HR verify |
| 3 | Passport | Mandatory | qty 1, HR verify, Can't Provide → reason + warning |
| 4 | Latest 3-Month Payslips — last 2 employers | Required | per employer, per month (3), HR verify |
| 5 | Offer Letter — last 2 employers | Required | per employer, HR verify |
| 6 | Relieving Letter — last 2 employers | Required | per employer, HR verify |
| 7 | Increment Letter | Conditional | if applicable, HR verify |
| 8 | 10th Certificate | Mandatory | qty 1, HR verify |
| 9 | 12th Certificate | Mandatory | qty 1, HR verify |
| 10 | Degree Certificate / Semester-wise Mark Sheets | Mandatory | multiple files, HR verify |
| 11 | Current & Permanent Address Proof | Required | qty configurable, HR verify |
| 12 | Appointment Letter — last 2 employers | Required | per employer, HR verify |
| 13 | 2 Passport-Size Photographs | Mandatory | qty 2 (Photo 1, Photo 2), HR verify |
| 14 | Cancelled Cheque | Required | qty 1, HR verify |
| 15 | Last Three Employment Details | Required | **structured data**, 3 records, HR verify |
| 16 | Current Offer Letter / Existing Offer | Conditional | if applicable, HR verify |

## 4. Multi-employer documents

Payslips, Offer Letter, Relieving Letter, Appointment Letter require **employer-wise
submission** — not one generic upload field. Configurable employer count; current
requirement = **last 2 employers**. Backend keeps the relationship:
`candidate → employer → document type → (pay period) → document`. HR needs to know which
employer each document belongs to.

### Payslips (structured)

Per employer the candidate adds: employer name, employment period, designation. Then
uploads: latest-month, previous-month, third-latest-month payslip. Do not force three
unrelated files without identifying employer/month.

## 5. Employment history (structured, item 15)

Structured section, 3 records. Minimum stored fields per record:
`company_name, designation, joining_date, leaving_date, last_drawn_salary`. Salary
structure configurable per HR requirements.

## 6. Degree / mark sheets (item 10)

Allow Degree Certificate and/or Semester-wise Mark Sheets. Support **multiple files**
(e.g. Semester 1..N + Degree Certificate). Not limited to a single file.

## 7. Aadhaar (item 2)

One logical requirement with two required sides (Front, Back). Both must be uploaded
before the requirement is complete. Never mark complete with only one side.

## 8. Passport photos (item 13)

Configured quantity = 2. UI clearly shows Photo 1 / Photo 2 — candidate should not have
to guess how many files are needed.

## 9. Conditional documents (items 7, 16)

Candidate explicitly chooses: "I have an Increment Letter" / "Not Applicable"
(and similarly "I currently have another offer" / "I do not"). If applicable → upload.
If not → do not block the offer workflow.

## 10. Can't Provide flow

For mandatory/required documents: "Can't Provide This Document" → **reason mandatory**,
candidate cannot continue without it. Store the reason. Example: Relieving Letter →
Can't Provide → "My previous employer has not issued the relieving letter yet."

Immediately after selecting Can't Provide show a **visible warning** (not a hidden
tooltip): *"**Important:** This document is required for the verification process. Not
providing the document may affect your application and can lead to rejection."*
For highly sensitive/mandatory documents the warning must be clearly visible.

## 11. HR verification

Candidate submits all pre-offer documents → HR verification queue. HR sees the complete
checklist. Per document: Document, Candidate, Employer (if applicable), Uploaded Date,
File, Status, HR Remarks, Action.

### Controlled document states

`Requested | Uploaded | Under Verification | Verified | Correction Required |
Can't Provide`. No arbitrary status values from the frontend.

### HR actions

- **Verify** → `Verified`.
- **Request Correction** → `Correction Required`; HR remark **mandatory**
  (e.g. "The uploaded PAN card is unclear. Please upload a clearer copy.").

### HR verification dashboard (per candidate)

```
Documents Required: 16
Submitted: 15
Verified: 13
Correction Required: 1
Can't Provide: 1
Pending: 1
```

For multi-file requirements, completion is computed from the configured requirement
rules (e.g. Aadhaar needs both sides; payslips need 3 months × 2 employers).

## 12. Offer readiness & offer lock (critical)

Candidate does NOT become offer-ready merely because files were uploaded. Compute
`Offer Readiness` from: required documents + mandatory documents + conditional
requirements + HR verification + employment information.

**Offer lock** — TA cannot send the offer until ALL of:

```
Interview Process = Completed
AND Candidate = Selected / Advanced
AND Required Pre-Offer Documents = Submitted
AND HR Verification = Completed
AND No blocking document = Correction Required
```

If TA opens the Offer Composer early:
*"Offer cannot be sent yet. Complete the required document verification process first."*

Backend contract:

```json
{ "offerReady": true }
```

or

```json
{ "offerReady": false,
  "blockingReasons": ["Passport not verified",
                      "Relieving Letter from previous employer requires correction"] }
```

TA UI shows why the offer is locked, e.g. `12 / 16 requirements cleared` + a list of
blocking items. Once cleared: *"Offer Ready — All required pre-offer documents have been
verified by HR. You can now prepare and send the offer letter."*

## 13. Notifications

- **HR Verification Complete** → TA. Expandable panel listing each verified group +
  "You may now proceed with the offer."
- **HR Verification Requires Action** → TA. Expandable panel: candidate, correction
  required item(s), HR remark, "Request corrected document from candidate."
- Candidate also gets email + in-app notification on correction.

## 14. Correction loop

```
HR → Correction Required → TA notification → Candidate notification → Candidate email
→ Candidate uploads corrected document → HR verification
```

Previous document versions stay in the audit history.

## 15. Timeline events

```
Interview Process Completed → Pre-Offer Documents Requested → Candidate Submitted Documents
→ HR Verification Started → Documents Verified → Offer Unlocked → Offer Sent
```

Correction path: `HR Verification → Correction Required → Candidate Resubmitted →
HR Re-verified`. All events remain in the timeline.

## 16. Document requirement data model (flexible engine)

`document_requirements` fields:

```
id  name  description  stage  is_required  is_conditional  condition_type
quantity_required  requires_front_back  requires_employer  requires_period
requires_hr_verification  can_mark_cannot_provide  reason_required  warning_message
allowed_file_types  max_file_size  display_order  active  created_at  updated_at
```

`stage` values: `application | pre_offer | offer | onboarding | employee`. This
requirement set is `stage = pre_offer`.

The engine must represent: one document; multiple documents; front/back document;
employer-specific documents; period-specific documents; conditional documents;
structured employment information; documents requiring HR verification; documents
requiring correction; documents that cannot be provided. **Do not simply create 16
upload boxes** — the UI must make these distinctions obvious to candidate and HR.

## 17. Pre-offer workflow (full)

```
Candidate Selected → TA "Proceed to Documents" → Candidate email → Candidate opens
Document Center → Pre-Offer Checklist appears → Candidate uploads documents → Candidate
provides employment details → Candidate handles conditional documents → Can't Provide
where applicable (reason mandatory, warning shown) → Candidate submits → HR verification
queue → HR reviews every requirement →
  ├─ Verified
  └─ Correction Required → Candidate correction → HR re-verification
→ All required items cleared → TA notification → Offer unlocked → Offer Composer
→ Offer Letter sent
```
