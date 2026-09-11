# Project graph — recruitment-onboarding-frontend

_Generated 2026-09-09 by `scripts/graphify.mjs`. 112 files, 381 import edges._

**Read this file instead of scanning `src/`.** Regenerate after code changes with `npm run graph`.

## Layers

- `component` — 51
- `page` — 27
- `navigation` — 11
- `util` — 4
- `hook` — 3
- `style` — 3
- `layout` — 3
- `entry` — 2
- `route` — 2
- `constant` — 2
- `context` — 2
- `data` — 2

## Most depended-on files (hubs)

- `src/components/common/Icon.jsx` — 59 importers
- `src/context/AppContext.jsx` — 31 importers
- `src/utils/format.js` — 26 importers
- `src/constants/statuses.js` — 24 importers
- `src/components/common/Button.jsx` — 13 importers
- `src/components/ta/Button.jsx` — 13 importers
- `src/constants/roles.js` — 13 importers
- `src/context/ToastContext.jsx` — 12 importers
- `src/components/ta/Card.jsx` — 11 importers
- `src/components/ta/TAHeader.jsx` — 11 importers
- `src/components/ta/Tag.jsx` — 10 importers
- `src/components/ta/EmptyState.jsx` — 9 importers

## Routes

| path | component |
| --- | --- |
| `/` | LoginPage |
| `/login` | Navigate |
| `/candidate` | LandingPage |
| `/candidate/jobs` | JobsPage |
| `/candidate/jobs/:jobId` | JobDetailsPage |
| `/candidate/apply` | ApplyPage |
| `/candidate/apply/:jobId` | ApplyPage |
| `/candidate/application` | MyApplicationPage |
| `/candidate/application/success` | ApplicationSuccessPage |
| `/candidate/profile` | CandidateProfilePage |
| `/jobs` | Navigate |
| `/jobs/:jobId` | LegacyJobRedirect |
| `/apply` | Navigate |
| `/how-it-works` | Navigate |
| `/application-success` | Navigate |
| `/my-application` | Navigate |
| `/ta` | TADashboard |
| `/ta/applications` | Navigate |
| `/ta/candidates` | TACandidatesPage |
| `/ta/candidates/:candidateId` | TACandidateDetailPage |
| `/ta/interviews` | TAInterviewsPage |
| `/ta/documents` | TADocumentsPage |
| `/ta/offers` | TAOffersPage |
| `/ta/jobs` | TAJobsPage |
| `/ta/jobs/:jobId` | TAJobDetailPage |
| `/ta/activity` | TAActivityPage |
| `/ta/settings` | SettingsPage |
| `/ta/profile` | ProfilePage |
| `/hr` | HRDashboard |
| `/hr/candidates` | HRCandidatesPage |
| `/hr/candidates/:candidateId` | HRCandidateDetailPage |
| `/hr/offers` | Navigate |
| `/hr/employees` | HREmployeesPage |
| `/hr/activity` | HRActivityPage |
| `/hr/settings` | SettingsPage |
| `/hr/profile` | ProfilePage |
| `*` | Navigate |

## Not imported anywhere

- `src/components/common/ActiveFilters.jsx`
- `src/components/common/Avatar.jsx`
- `src/components/common/DocumentCard.jsx`
- `src/components/common/FileUpload.jsx`
- `src/components/common/Metric.jsx`
- `src/components/common/PipelineFunnel.jsx`
- `src/components/common/ProgressRing.jsx`
- `src/components/common/Sparkline.jsx`
- `src/components/common/StatTiles.jsx`
- `src/components/common/Stepper.jsx`
- `src/components/common/Timeline.jsx`
- `src/components/common/Tooltip.jsx`
- `src/components/navigation/Sidebar.jsx`
- `src/components/navigation/Topbar.jsx`
- `src/components/workflow/DocumentTable.jsx`
- `src/components/workflow/RecruitmentTimeline.jsx`
- `src/pages/hr/HROffersPage.jsx`

## Files by layer

### entry

- **`src/App.jsx`**
  35 loc · imports 5 · imported by 1 · exports: default (App)
  imports: `src/routes/AppRoutes.jsx`, `src/components/common/ToastContainer.jsx`, `src/components/demo/DemoFlow.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`
  importedBy: `src/main.jsx`
- **`src/main.jsx`**
  32 loc · imports 6 · imported by 0
  imports: `src/App.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/index.css`, `src/styles/ta.css`, `src/styles/home.css`

### route

- **`src/components/routing/RoleRoute.jsx`**
  13 loc · imports 1 · imported by 1 · exports: default (RoleRoute)
  imports: `src/context/AppContext.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/routes/AppRoutes.jsx`**
  113 loc · imports 28 · imported by 1 · exports: default (AppRoutes)
  imports: `src/layouts/CandidateLayout.jsx`, `src/layouts/TALayout.jsx`, `src/layouts/HRLayout.jsx`, `src/components/routing/RoleRoute.jsx`, `src/pages/LoginPage.jsx`, `src/pages/candidate/LandingPage.jsx`, `src/pages/candidate/JobsPage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/ApplyPage.jsx`, `src/pages/candidate/ApplicationSuccessPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/candidate/CandidateProfilePage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TADocumentsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAActivityPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HRActivityPage.jsx`, `src/pages/shared/SettingsPage.jsx`, `src/pages/shared/ProfilePage.jsx`
  importedBy: `src/App.jsx`

### layout

- **`src/layouts/CandidateLayout.jsx`**
  18 loc · imports 1 · imported by 1 · exports: default (CandidateLayout)
  imports: `src/components/navigation/CandidateHeader.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/layouts/HRLayout.jsx`**
  91 loc · imports 5 · imported by 1 · exports: default (HRLayout)
  imports: `src/components/navigation/HRSidebar.jsx`, `src/components/navigation/HRTopbar.jsx`, `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/statuses.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/layouts/TALayout.jsx`**
  68 loc · imports 3 · imported by 1 · exports: default (TALayout)
  imports: `src/components/navigation/TASidebar.jsx`, `src/components/navigation/TATopbar.jsx`, `src/components/common/Icon.jsx`
  importedBy: `src/routes/AppRoutes.jsx`

### navigation

- **`src/components/navigation/CandidateHeader.jsx`**
  35 loc · imports 2 · imported by 1 · exports: default (CandidateHeader)
  imports: `src/components/navigation/ProfileMenu.jsx`, `src/constants/roles.js`
  importedBy: `src/layouts/CandidateLayout.jsx`
- **`src/components/navigation/GlobalSearch.jsx`**
  107 loc · imports 2 · imported by 3 · exports: default (GlobalSearch)
  imports: `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`
  importedBy: `src/components/navigation/HRTopbar.jsx`, `src/components/navigation/TATopbar.jsx`, `src/components/navigation/Topbar.jsx`
- **`src/components/navigation/HRSidebar.jsx`**
  54 loc · imports 1 · imported by 1 · exports: default (HRSidebar)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/layouts/HRLayout.jsx`
- **`src/components/navigation/HRTopbar.jsx`**
  32 loc · imports 5 · imported by 1 · exports: default (HRTopbar)
  imports: `src/components/common/Icon.jsx`, `src/components/navigation/GlobalSearch.jsx`, `src/components/navigation/NotificationBell.jsx`, `src/components/navigation/ProfileMenu.jsx`, `src/constants/roles.js`
  importedBy: `src/layouts/HRLayout.jsx`
- **`src/components/navigation/NotificationBell.jsx`**
  44 loc · imports 3 · imported by 3 · exports: default (NotificationBell)
  imports: `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/utils/format.js`
  importedBy: `src/components/navigation/HRTopbar.jsx`, `src/components/navigation/TATopbar.jsx`, `src/components/navigation/Topbar.jsx`
- **`src/components/navigation/ProfileMenu.jsx`**
  90 loc · imports 3 · imported by 3 · exports: default (ProfileMenu)
  imports: `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`
  importedBy: `src/components/navigation/CandidateHeader.jsx`, `src/components/navigation/HRTopbar.jsx`, `src/components/navigation/TATopbar.jsx`
- **`src/components/navigation/RoleSwitcher.jsx`**
  54 loc · imports 3 · imported by 1 · exports: default (RoleSwitcher)
  imports: `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`
  importedBy: `src/components/navigation/Topbar.jsx`
- **`src/components/navigation/Sidebar.jsx`**
  43 loc · imports 1 · imported by 0 · exports: default (Sidebar)
  imports: `src/components/common/Icon.jsx`
- **`src/components/navigation/TASidebar.jsx`**
  59 loc · imports 1 · imported by 1 · exports: default (TASidebar)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/layouts/TALayout.jsx`
- **`src/components/navigation/TATopbar.jsx`**
  31 loc · imports 5 · imported by 1 · exports: default (TATopbar)
  imports: `src/components/common/Icon.jsx`, `src/components/navigation/GlobalSearch.jsx`, `src/components/navigation/NotificationBell.jsx`, `src/components/navigation/ProfileMenu.jsx`, `src/constants/roles.js`
  importedBy: `src/layouts/TALayout.jsx`
- **`src/components/navigation/Topbar.jsx`**
  32 loc · imports 5 · imported by 0 · exports: default (Topbar)
  imports: `src/components/common/Icon.jsx`, `src/components/navigation/GlobalSearch.jsx`, `src/components/navigation/NotificationBell.jsx`, `src/components/navigation/RoleSwitcher.jsx`, `src/constants/roles.js`

### page

- **`src/pages/candidate/ApplicationSuccessPage.jsx`**
  61 loc · imports 3 · imported by 1 · exports: default (ApplicationSuccessPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Card.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/candidate/ApplyPage.jsx`**
  353 loc · imports 9 · imported by 1 · exports: default (ApplyPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/Field.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/utils/resumeParser.js`, `src/hooks/useLocalStorage.js`, `src/utils/ids.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/candidate/CandidateProfilePage.jsx`**
  87 loc · imports 5 · imported by 1 · exports: default (CandidateProfilePage)
  imports: `src/components/ta/Button.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/EmptyState.jsx`, `src/context/AppContext.jsx`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/candidate/JobDetailsPage.jsx`**
  95 loc · imports 6 · imported by 1 · exports: default (JobDetailsPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/EmptyState.jsx`, `src/context/AppContext.jsx`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/candidate/JobsPage.jsx`**
  26 loc · imports 4 · imported by 1 · exports: default (JobsPage)
  imports: `src/components/ta/Button.jsx`, `src/components/JobBrowser.jsx`, `src/context/AppContext.jsx`, `src/hooks/useJobFilters.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/candidate/LandingPage.jsx`**
  27 loc · imports 4 · imported by 1 · exports: default (LandingPage)
  imports: `src/components/ta/Button.jsx`, `src/components/JobBrowser.jsx`, `src/context/AppContext.jsx`, `src/hooks/useJobFilters.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/candidate/MyApplicationPage.jsx`**
  490 loc · imports 10 · imported by 1 · exports: default (MyApplicationPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/Tag.jsx`, `src/components/ta/EmptyState.jsx`, `src/components/common/Field.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/utils/format.js`, `src/constants/statuses.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/hr/HRActivityPage.jsx`**
  6 loc · imports 1 · imported by 1 · exports: default (HRActivityPage)
  imports: `src/pages/shared/ActivityFeed.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/hr/HRCandidateDetailPage.jsx`**
  276 loc · imports 13 · imported by 1 · exports: default (HRCandidateDetailPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Tag.jsx`, `src/components/ta/EmptyState.jsx`, `src/components/ta/Avatar.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/components/workflow/AssignRoleModal.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/hr/HRCandidatesPage.jsx`**
  201 loc · imports 10 · imported by 1 · exports: default (HRCandidatesPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/StatBar.jsx`, `src/components/ta/DataGrid.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/ta/Tag.jsx`, `src/context/AppContext.jsx`, `src/hooks/useCollectionView.js`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/hr/HRDashboard.jsx`**
  307 loc · imports 11 · imported by 1 · exports: default (HRDashboard)
  imports: `src/components/ta/TAHeader.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/KpiCard.jsx`, `src/components/ta/DonutChart.jsx`, `src/components/ta/LifecycleFunnel.jsx`, `src/components/ta/Tag.jsx`, `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/hr/HREmployeesPage.jsx`**
  194 loc · imports 10 · imported by 1 · exports: default (HREmployeesPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/StatBar.jsx`, `src/components/ta/DataGrid.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/ta/Tag.jsx`, `src/context/AppContext.jsx`, `src/hooks/useCollectionView.js`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/hr/HROffersPage.jsx`**
  116 loc · imports 10 · imported by 0 · exports: default (HROffersPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/DataGrid.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/ta/Avatar.jsx`, `src/components/ta/Tag.jsx`, `src/context/AppContext.jsx`, `src/hooks/useCollectionView.js`, `src/constants/statuses.js`, `src/utils/format.js`
- **`src/pages/LoginPage.jsx`**
  135 loc · imports 3 · imported by 1 · exports: default (LoginPage)
  imports: `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/shared/ActivityFeed.jsx`**
  193 loc · imports 8 · imported by 2 · exports: default (ActivityFeed)
  imports: `src/components/ta/TAHeader.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/StatBar.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/ta/EmptyState.jsx`, `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/statuses.js`
  importedBy: `src/pages/hr/HRActivityPage.jsx`, `src/pages/talentAcquisition/TAActivityPage.jsx`
- **`src/pages/shared/DocumentsReview.jsx`**
  116 loc · imports 10 · imported by 1 · exports: default (DocumentsReview)
  imports: `src/components/common/Table.jsx`, `src/components/common/Badge.jsx`, `src/components/common/Button.jsx`, `src/components/common/SearchBar.jsx`, `src/components/common/FilterSelect.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/pages/talentAcquisition/TADocumentsPage.jsx`
- **`src/pages/shared/ProfilePage.jsx`**
  32 loc · imports 2 · imported by 1 · exports: default (ProfilePage)
  imports: `src/components/common/Card.jsx`, `src/constants/roles.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/shared/SettingsPage.jsx`**
  49 loc · imports 5 · imported by 1 · exports: default (SettingsPage)
  imports: `src/components/common/Card.jsx`, `src/components/common/Button.jsx`, `src/components/common/Modal.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TAActivityPage.jsx`**
  6 loc · imports 1 · imported by 1 · exports: default (TAActivityPage)
  imports: `src/pages/shared/ActivityFeed.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TACandidateDetailPage.jsx`**
  349 loc · imports 16 · imported by 1 · exports: default (TACandidateDetailPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Tag.jsx`, `src/components/ta/EmptyState.jsx`, `src/components/ta/Avatar.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/components/workflow/ScheduleInterviewModal.jsx`, `src/components/workflow/InterviewResultModal.jsx`, `src/components/workflow/OfferDrawer.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/data/jobs.js`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TACandidatesPage.jsx`**
  195 loc · imports 9 · imported by 1 · exports: default (TACandidatesPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/DataGrid.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/ta/Tag.jsx`, `src/context/AppContext.jsx`, `src/hooks/useCollectionView.js`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TADashboard.jsx`**
  288 loc · imports 11 · imported by 1 · exports: default (TADashboard)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/KpiCard.jsx`, `src/components/ta/DonutChart.jsx`, `src/components/ta/FunnelChart.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`, `src/constants/statuses.js`, `src/utils/metrics.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TADocumentsPage.jsx`**
  6 loc · imports 1 · imported by 1 · exports: default (TADocumentsPage)
  imports: `src/pages/shared/DocumentsReview.jsx`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TAInterviewsPage.jsx`**
  114 loc · imports 10 · imported by 1 · exports: default (TAInterviewsPage)
  imports: `src/components/common/Table.jsx`, `src/components/common/Badge.jsx`, `src/components/common/Button.jsx`, `src/components/common/SearchBar.jsx`, `src/components/common/FilterSelect.jsx`, `src/components/workflow/InterviewResultModal.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TAJobDetailPage.jsx`**
  115 loc · imports 9 · imported by 1 · exports: default (TAJobDetailPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/Card.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Tag.jsx`, `src/components/ta/EmptyState.jsx`, `src/context/AppContext.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TAJobsPage.jsx`**
  158 loc · imports 11 · imported by 1 · exports: default (TAJobsPage)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/TAHeader.jsx`, `src/components/ta/DataGrid.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/Tag.jsx`, `src/components/workflow/CreateJobDrawer.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/hooks/useCollectionView.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`
- **`src/pages/talentAcquisition/TAOffersPage.jsx`**
  142 loc · imports 12 · imported by 1 · exports: default (TAOffersPage)
  imports: `src/components/common/Table.jsx`, `src/components/common/Badge.jsx`, `src/components/common/Button.jsx`, `src/components/common/SearchBar.jsx`, `src/components/common/FilterSelect.jsx`, `src/components/workflow/OfferDrawer.jsx`, `src/components/common/States.jsx`, `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/constants/statuses.js`, `src/data/jobs.js`, `src/utils/format.js`
  importedBy: `src/routes/AppRoutes.jsx`

### component

- **`src/components/common/ActiveFilters.jsx`**
  26 loc · imports 1 · imported by 0 · exports: default (ActiveFilters)
  imports: `src/components/common/Icon.jsx`
- **`src/components/common/Avatar.jsx`**
  24 loc · imports 1 · imported by 0 · exports: default (Avatar), Identity
  imports: `src/utils/format.js`
- **`src/components/common/Badge.jsx`**
  23 loc · imports 2 · imported by 5 · exports: Badge, StatusBadge
  imports: `src/components/common/Icon.jsx`, `src/constants/statuses.js`
  importedBy: `src/components/common/DocumentCard.jsx`, `src/components/workflow/DocumentTable.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/common/Button.jsx`**
  31 loc · imports 1 · imported by 13 · exports: default (Button)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/common/FileUpload.jsx`, `src/components/common/Modal.jsx`, `src/components/workflow/AssignRoleModal.jsx`, `src/components/workflow/CreateJobDrawer.jsx`, `src/components/workflow/DocumentTable.jsx`, `src/components/workflow/InterviewResultModal.jsx`, `src/components/workflow/OfferDrawer.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/components/workflow/ScheduleInterviewModal.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/shared/SettingsPage.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/common/Card.jsx`**
  51 loc · imports 1 · imported by 2 · exports: Card, KPICard, InfoList
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/shared/ProfilePage.jsx`, `src/pages/shared/SettingsPage.jsx`
- **`src/components/common/ChipsInput.jsx`**
  42 loc · imports 1 · imported by 1 · exports: default (ChipsInput)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/workflow/CreateJobDrawer.jsx`
- **`src/components/common/DocumentCard.jsx`**
  26 loc · imports 4 · imported by 0 · exports: default (DocumentCard)
  imports: `src/components/common/Icon.jsx`, `src/components/common/Badge.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
- **`src/components/common/Field.jsx`**
  70 loc · imports 1 · imported by 7 · exports: Field, Input, Textarea, Select
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/workflow/AssignRoleModal.jsx`, `src/components/workflow/CreateJobDrawer.jsx`, `src/components/workflow/InterviewResultModal.jsx`, `src/components/workflow/OfferDrawer.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/components/workflow/ScheduleInterviewModal.jsx`, `src/pages/candidate/MyApplicationPage.jsx`
- **`src/components/common/FileUpload.jsx`**
  112 loc · imports 2 · imported by 0 · exports: default (FileUpload)
  imports: `src/components/common/Icon.jsx`, `src/components/common/Button.jsx`
- **`src/components/common/FilterSelect.jsx`**
  31 loc · imports 1 · imported by 3 · exports: default (FilterSelect)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/common/Icon.jsx`**
  35 loc · imports 0 · imported by 59 · exports: default (Icon)
  importedBy: `src/components/JobBrowser.jsx`, `src/components/JobCard.jsx`, `src/components/JobFilters.jsx`, `src/components/common/ActiveFilters.jsx`, `src/components/common/Badge.jsx`, `src/components/common/Button.jsx`, `src/components/common/Card.jsx`, `src/components/common/ChipsInput.jsx`, `src/components/common/DocumentCard.jsx`, `src/components/common/Field.jsx`, `src/components/common/FileUpload.jsx`, `src/components/common/FilterSelect.jsx`, `src/components/common/Modal.jsx`, `src/components/common/SearchBar.jsx`, `src/components/common/States.jsx`, `src/components/common/Stepper.jsx`, `src/components/common/Table.jsx`, `src/components/common/Timeline.jsx`, `src/components/common/ToastContainer.jsx`, `src/components/demo/DemoFlow.jsx`, `src/components/navigation/GlobalSearch.jsx`, `src/components/navigation/HRSidebar.jsx`, `src/components/navigation/HRTopbar.jsx`, `src/components/navigation/NotificationBell.jsx`, `src/components/navigation/ProfileMenu.jsx`, `src/components/navigation/RoleSwitcher.jsx`, `src/components/navigation/Sidebar.jsx`, `src/components/navigation/TASidebar.jsx`, `src/components/navigation/TATopbar.jsx`, `src/components/navigation/Topbar.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/DataGrid.jsx`, `src/components/ta/EmptyState.jsx`, `src/components/ta/Field.jsx`, `src/components/ta/KpiCard.jsx`, `src/components/ta/LifecycleFunnel.jsx`, `src/components/ta/Pager.jsx`, `src/components/ta/StatBar.jsx`, `src/components/ta/Tag.jsx`, `src/components/ta/Toolbar.jsx`, `src/components/workflow/RecruitmentTimeline.jsx`, `src/layouts/HRLayout.jsx`, `src/layouts/TALayout.jsx`, `src/pages/LoginPage.jsx`, `src/pages/candidate/ApplicationSuccessPage.jsx`, `src/pages/candidate/ApplyPage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/common/Metric.jsx`**
  28 loc · imports 0 · imported by 0 · exports: default (Metric)
- **`src/components/common/Modal.jsx`**
  80 loc · imports 2 · imported by 7 · exports: Modal, Drawer, ConfirmDialog
  imports: `src/components/common/Icon.jsx`, `src/components/common/Button.jsx`
  importedBy: `src/components/workflow/AssignRoleModal.jsx`, `src/components/workflow/CreateJobDrawer.jsx`, `src/components/workflow/InterviewResultModal.jsx`, `src/components/workflow/OfferDrawer.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/components/workflow/ScheduleInterviewModal.jsx`, `src/pages/shared/SettingsPage.jsx`
- **`src/components/common/PipelineFunnel.jsx`** — Horizontal funnel of the recruitment pipeline. `stages` = [{ label, value, muted? }]
  24 loc · imports 0 · imported by 0 · exports: default (PipelineFunnel)
- **`src/components/common/ProgressRing.jsx`**
  24 loc · imports 0 · imported by 0 · exports: default (ProgressRing)
- **`src/components/common/SearchBar.jsx`**
  16 loc · imports 1 · imported by 3 · exports: default (SearchBar)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/common/Sparkline.jsx`** — Thin full-width inline SVG sparkline. `data` = array of numbers.
  26 loc · imports 0 · imported by 0 · exports: default (Sparkline)
- **`src/components/common/States.jsx`**
  38 loc · imports 1 · imported by 2 · exports: EmptyState, LoadingState, Spinner, SkeletonRows
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/common/Table.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/common/StatTiles.jsx`** — Compact stat-tile row for list / pipeline pages. tiles = [{ n, label, tone?: 'accent' | 'warn', onClick?, active? }]
  35 loc · imports 0 · imported by 0 · exports: default (StatTiles)
- **`src/components/common/Stepper.jsx`**
  23 loc · imports 1 · imported by 0 · exports: default (Stepper)
  imports: `src/components/common/Icon.jsx`
- **`src/components/common/Table.jsx`**
  83 loc · imports 2 · imported by 4 · exports: Pagination, DataTable
  imports: `src/components/common/Icon.jsx`, `src/components/common/States.jsx`
  importedBy: `src/components/workflow/DocumentTable.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/common/Timeline.jsx`**
  73 loc · imports 2 · imported by 0 · exports: TYPE_META, ActivityTimeline, StageTracker
  imports: `src/components/common/Icon.jsx`, `src/utils/format.js`
- **`src/components/common/ToastContainer.jsx`**
  30 loc · imports 2 · imported by 1 · exports: default (ToastContainer)
  imports: `src/components/common/Icon.jsx`, `src/context/ToastContext.jsx`
  importedBy: `src/App.jsx`
- **`src/components/common/Tooltip.jsx`**
  12 loc · imports 0 · imported by 0 · exports: default (Tooltip)
- **`src/components/demo/DemoFlow.jsx`**
  466 loc · imports 4 · imported by 1 · exports: default (DemoFlow)
  imports: `src/components/common/Icon.jsx`, `src/context/AppContext.jsx`, `src/constants/roles.js`, `src/constants/statuses.js`
  importedBy: `src/App.jsx`
- **`src/components/JobBrowser.jsx`**
  75 loc · imports 6 · imported by 2 · exports: default (JobBrowser)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Button.jsx`, `src/components/ta/EmptyState.jsx`, `src/components/ta/Pager.jsx`, `src/components/JobCard.jsx`, `src/components/JobFilters.jsx`
  importedBy: `src/pages/candidate/JobsPage.jsx`, `src/pages/candidate/LandingPage.jsx`
- **`src/components/JobCard.jsx`**
  53 loc · imports 2 · imported by 1 · exports: default (JobCard)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Button.jsx`
  importedBy: `src/components/JobBrowser.jsx`
- **`src/components/JobFilters.jsx`**
  63 loc · imports 2 · imported by 1 · exports: default (JobFilters)
  imports: `src/components/common/Icon.jsx`, `src/hooks/useJobFilters.js`
  importedBy: `src/components/JobBrowser.jsx`
- **`src/components/ta/Avatar.jsx`**
  11 loc · imports 1 · imported by 3 · exports: default (Avatar)
  imports: `src/utils/format.js`
  importedBy: `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`
- **`src/components/ta/Button.jsx`**
  13 loc · imports 1 · imported by 13 · exports: default (Button)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/JobBrowser.jsx`, `src/components/JobCard.jsx`, `src/pages/candidate/ApplicationSuccessPage.jsx`, `src/pages/candidate/ApplyPage.jsx`, `src/pages/candidate/CandidateProfilePage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/JobsPage.jsx`, `src/pages/candidate/LandingPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/ta/Card.jsx`** — Plain premium card. Optional header with a title and a right-side action.
  15 loc · imports 0 · imported by 11 · exports: default (Card)
  importedBy: `src/pages/candidate/ApplicationSuccessPage.jsx`, `src/pages/candidate/ApplyPage.jsx`, `src/pages/candidate/CandidateProfilePage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`
- **`src/components/ta/DataGrid.jsx`**
  72 loc · imports 2 · imported by 5 · exports: default (DataGrid)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/EmptyState.jsx`
  importedBy: `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/ta/DonutChart.jsx`**
  88 loc · imports 0 · imported by 2 · exports: default (DonutChart)
  importedBy: `src/pages/hr/HRDashboard.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`
- **`src/components/ta/EmptyState.jsx`**
  14 loc · imports 1 · imported by 9 · exports: default (EmptyState)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/JobBrowser.jsx`, `src/components/ta/DataGrid.jsx`, `src/pages/candidate/CandidateProfilePage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`
- **`src/components/ta/Field.jsx`**
  64 loc · imports 1 · imported by 1 · exports: Field, Input, Textarea, Select, Checkbox, FieldGrid
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/candidate/ApplyPage.jsx`
- **`src/components/ta/FunnelChart.jsx`**
  61 loc · imports 0 · imported by 1 · exports: default (FunnelChart)
  importedBy: `src/pages/talentAcquisition/TADashboard.jsx`
- **`src/components/ta/KpiCard.jsx`**
  52 loc · imports 1 · imported by 2 · exports: default (KpiCard)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/hr/HRDashboard.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`
- **`src/components/ta/LifecycleFunnel.jsx`**
  49 loc · imports 1 · imported by 1 · exports: default (LifecycleFunnel)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/hr/HRDashboard.jsx`
- **`src/components/ta/Pager.jsx`**
  54 loc · imports 1 · imported by 2 · exports: default (Pager)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/components/JobBrowser.jsx`, `src/components/ta/Toolbar.jsx`
- **`src/components/ta/StatBar.jsx`**
  30 loc · imports 1 · imported by 3 · exports: default (StatBar)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/shared/ActivityFeed.jsx`
- **`src/components/ta/Tag.jsx`**
  13 loc · imports 1 · imported by 10 · exports: default (Tag)
  imports: `src/components/common/Icon.jsx`
  importedBy: `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/ta/TAHeader.jsx`**
  19 loc · imports 0 · imported by 11 · exports: default (TAHeader)
  importedBy: `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/ta/Toolbar.jsx`**
  53 loc · imports 2 · imported by 6 · exports: default (Toolbar)
  imports: `src/components/common/Icon.jsx`, `src/components/ta/Pager.jsx`
  importedBy: `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/workflow/AssignRoleModal.jsx`**
  64 loc · imports 3 · imported by 1 · exports: default (AssignRoleModal)
  imports: `src/components/common/Modal.jsx`, `src/components/common/Button.jsx`, `src/components/common/Field.jsx`
  importedBy: `src/pages/hr/HRCandidateDetailPage.jsx`
- **`src/components/workflow/CreateJobDrawer.jsx`**
  108 loc · imports 5 · imported by 1 · exports: default (CreateJobDrawer)
  imports: `src/components/common/Modal.jsx`, `src/components/common/Button.jsx`, `src/components/common/Field.jsx`, `src/components/common/ChipsInput.jsx`, `src/utils/format.js`
  importedBy: `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/components/workflow/DocumentTable.jsx`**
  92 loc · imports 7 · imported by 0 · exports: default (DocumentTable)
  imports: `src/components/common/Button.jsx`, `src/components/common/Badge.jsx`, `src/components/workflow/ReasonModal.jsx`, `src/components/common/Table.jsx`, `src/constants/statuses.js`, `src/utils/format.js`, `src/context/ToastContext.jsx`
- **`src/components/workflow/InterviewResultModal.jsx`**
  66 loc · imports 4 · imported by 2 · exports: default (InterviewResultModal)
  imports: `src/components/common/Modal.jsx`, `src/components/common/Button.jsx`, `src/components/common/Field.jsx`, `src/constants/statuses.js`
  importedBy: `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`
- **`src/components/workflow/OfferDrawer.jsx`**
  66 loc · imports 4 · imported by 2 · exports: default (OfferDrawer)
  imports: `src/components/common/Modal.jsx`, `src/components/common/Button.jsx`, `src/components/common/Field.jsx`, `src/utils/format.js`
  importedBy: `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/components/workflow/ReasonModal.jsx`**
  54 loc · imports 3 · imported by 4 · exports: default (ReasonModal)
  imports: `src/components/common/Modal.jsx`, `src/components/common/Button.jsx`, `src/components/common/Field.jsx`
  importedBy: `src/components/workflow/DocumentTable.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`
- **`src/components/workflow/RecruitmentTimeline.jsx`**
  65 loc · imports 3 · imported by 0 · exports: default (RecruitmentTimeline)
  imports: `src/components/common/Icon.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
- **`src/components/workflow/ScheduleInterviewModal.jsx`**
  88 loc · imports 5 · imported by 1 · exports: default (ScheduleInterviewModal)
  imports: `src/components/common/Modal.jsx`, `src/components/common/Button.jsx`, `src/components/common/Field.jsx`, `src/constants/statuses.js`, `src/utils/format.js`
  importedBy: `src/pages/talentAcquisition/TACandidateDetailPage.jsx`

### hook

- **`src/hooks/useCollectionView.js`**
  78 loc · imports 0 · imported by 5 · exports: useCollectionView
  importedBy: `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`
- **`src/hooks/useJobFilters.js`**
  57 loc · imports 0 · imported by 3 · exports: useJobFilters, EXPERIENCE_OPTIONS
  importedBy: `src/components/JobFilters.jsx`, `src/pages/candidate/JobsPage.jsx`, `src/pages/candidate/LandingPage.jsx`
- **`src/hooks/useLocalStorage.js`**
  43 loc · imports 0 · imported by 2 · exports: loadJSON, saveJSON, useLocalStorage
  importedBy: `src/context/AppContext.jsx`, `src/pages/candidate/ApplyPage.jsx`

### context

- **`src/context/AppContext.jsx`**
  748 loc · imports 6 · imported by 31 · exports: AppProvider, useApp
  imports: `src/hooks/useLocalStorage.js`, `src/data/seed.js`, `src/data/jobs.js`, `src/constants/statuses.js`, `src/constants/roles.js`, `src/utils/ids.js`
  importedBy: `src/App.jsx`, `src/components/demo/DemoFlow.jsx`, `src/components/navigation/GlobalSearch.jsx`, `src/components/navigation/NotificationBell.jsx`, `src/components/navigation/ProfileMenu.jsx`, `src/components/navigation/RoleSwitcher.jsx`, `src/components/routing/RoleRoute.jsx`, `src/layouts/HRLayout.jsx`, `src/main.jsx`, `src/pages/LoginPage.jsx`, `src/pages/candidate/ApplyPage.jsx`, `src/pages/candidate/CandidateProfilePage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/JobsPage.jsx`, `src/pages/candidate/LandingPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/shared/SettingsPage.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/context/ToastContext.jsx`**
  50 loc · imports 1 · imported by 12 · exports: ToastProvider, useToast, useToastList
  imports: `src/utils/ids.js`
  importedBy: `src/components/common/ToastContainer.jsx`, `src/components/workflow/DocumentTable.jsx`, `src/main.jsx`, `src/pages/candidate/ApplyPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/shared/SettingsPage.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`

### util

- **`src/utils/format.js`**
  51 loc · imports 0 · imported by 26 · exports: formatDate, formatDateTime, timeAgo, formatCurrencyINR, initialsOf, todayISO
  importedBy: `src/components/common/Avatar.jsx`, `src/components/common/DocumentCard.jsx`, `src/components/common/Timeline.jsx`, `src/components/navigation/NotificationBell.jsx`, `src/components/ta/Avatar.jsx`, `src/components/workflow/CreateJobDrawer.jsx`, `src/components/workflow/DocumentTable.jsx`, `src/components/workflow/OfferDrawer.jsx`, `src/components/workflow/RecruitmentTimeline.jsx`, `src/components/workflow/ScheduleInterviewModal.jsx`, `src/pages/candidate/CandidateProfilePage.jsx`, `src/pages/candidate/JobDetailsPage.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAJobsPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/utils/ids.js`**
  22 loc · imports 0 · imported by 4 · exports: makeCandidateId, makeApplicationId, makeEmployeeId, makeOfferId, uid
  importedBy: `src/context/AppContext.jsx`, `src/context/ToastContext.jsx`, `src/data/seed.js`, `src/pages/candidate/ApplyPage.jsx`
- **`src/utils/metrics.js`** — Small pure helpers for dashboard numbers and charts. Everything here works on the real app data — no fake values.
  54 loc · imports 0 · imported by 1 · exports: countInWindow, trendPercent, weeklyCounts, groupCounts, noticePeriodDays
  importedBy: `src/pages/talentAcquisition/TADashboard.jsx`
- **`src/utils/resumeParser.js`** — ============================================================ Mock resume parser — pure frontend simulation. There is NO OCR / AI service. This returns a plausible extracted profile so the "upload resume -> auto-fill" flow feels real. Everyt
  131 loc · imports 0 · imported by 1 · exports: MISSING_FIELDS, simulateResumeParse, AUTOFILLED_FIELDS, ANALYZE_STEPS
  importedBy: `src/pages/candidate/ApplyPage.jsx`

### constant

- **`src/constants/roles.js`**
  30 loc · imports 0 · imported by 13 · exports: ROLES, ROLE_META, DEMO_USERS
  importedBy: `src/App.jsx`, `src/components/demo/DemoFlow.jsx`, `src/components/navigation/CandidateHeader.jsx`, `src/components/navigation/HRTopbar.jsx`, `src/components/navigation/ProfileMenu.jsx`, `src/components/navigation/RoleSwitcher.jsx`, `src/components/navigation/TATopbar.jsx`, `src/components/navigation/Topbar.jsx`, `src/context/AppContext.jsx`, `src/pages/LoginPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/shared/ProfilePage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`
- **`src/constants/statuses.js`** — ============================================================ Centralized status system. Every status has: label, tone (badge variant), icon (lucide name). ============================================================
  234 loc · imports 0 · imported by 24 · exports: APP_STATUS, STATUS_META, statusMeta, PIPELINE_STAGES, stageIndexForStatus, stageBadgeForStatus, HR_FUNNEL_STAGES, hrStageRank, hrStageBadge, ROUND_STATUS, ROUND_STATUS_META, DOC_STATUS, DOC_STATUS_META, OFFER_STATUS, OFFER_STATUS_META, REQUIRED_DOCUMENTS, MANDATORY_DOC_KEYS, isDocMandatory, DOC_CATEGORIES, INTERVIEW_TYPES, INTERVIEW_MODES
  importedBy: `src/components/common/Badge.jsx`, `src/components/common/DocumentCard.jsx`, `src/components/demo/DemoFlow.jsx`, `src/components/workflow/DocumentTable.jsx`, `src/components/workflow/InterviewResultModal.jsx`, `src/components/workflow/RecruitmentTimeline.jsx`, `src/components/workflow/ScheduleInterviewModal.jsx`, `src/context/AppContext.jsx`, `src/data/seed.js`, `src/layouts/HRLayout.jsx`, `src/pages/candidate/MyApplicationPage.jsx`, `src/pages/hr/HRCandidateDetailPage.jsx`, `src/pages/hr/HRCandidatesPage.jsx`, `src/pages/hr/HRDashboard.jsx`, `src/pages/hr/HREmployeesPage.jsx`, `src/pages/hr/HROffersPage.jsx`, `src/pages/shared/ActivityFeed.jsx`, `src/pages/shared/DocumentsReview.jsx`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TACandidatesPage.jsx`, `src/pages/talentAcquisition/TADashboard.jsx`, `src/pages/talentAcquisition/TAInterviewsPage.jsx`, `src/pages/talentAcquisition/TAJobDetailPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`

### data

- **`src/data/jobs.js`**
  253 loc · imports 0 · imported by 4 · exports: JOBS, findJob
  importedBy: `src/context/AppContext.jsx`, `src/data/seed.js`, `src/pages/talentAcquisition/TACandidateDetailPage.jsx`, `src/pages/talentAcquisition/TAOffersPage.jsx`
- **`src/data/seed.js`**
  741 loc · imports 3 · imported by 1 · exports: SEED_VERSION, buildSeed
  imports: `src/constants/statuses.js`, `src/data/jobs.js`, `src/utils/ids.js`
  importedBy: `src/context/AppContext.jsx`

### style

- **`src/index.css`**
  847 loc · imports 0 · imported by 1
  importedBy: `src/main.jsx`
- **`src/styles/home.css`**
  142 loc · imports 0 · imported by 1
  importedBy: `src/main.jsx`
- **`src/styles/ta.css`**
  1521 loc · imports 0 · imported by 1
  importedBy: `src/main.jsx`
