# Frontend screens

Screen ↔ route ↔ Figma mapping, plus the audit behind the November 2026 cleanup.
Figma node IDs come from the `data-model-id` attributes Anima generated; "not
recorded" means the code never carried one, so none is guessed here.

## Active screens

| Route | Screen | File | Figma node | Data source |
| --- | --- | --- | --- | --- |
| `/` | Landing | `src/screens/Landing/LandingScreen.tsx` | not recorded | `GET /api/me/`, `POST /api/trees/` |
| `/sign-in` | Sign in | `src/screens/SignIn/SignInScreen.tsx` | `73:2` | allauth Google popup, `GET /api/me/` |
| `/my-trees` (sign-in required) | My Trees dashboard | `src/screens/MyTrees/MyTreesScreen.tsx` | none (built from the tree workspace's card/toolbar styles) | `GET /api/trees/` (includes `is_owner`, `member_count`) |
| `/family-tree/:treeId` (sign-in required) | Tree workspace | `src/screens/FamilyTree/FamilyTreeScreen.tsx` | tree canvas (`29:1967`, `21:160`) | `GET /api/trees/:id/`, `/members/`, `/relationships/` |
| `/invite/:token` (sign-in required) | Join a tree | `src/screens/Invite/InviteScreen.tsx` | none | `GET`/`POST /api/invite/:token/` |
| `/family-tree?tree=<id>` | redirect → `/family-tree/<id>` (old links) | `src/AppRoutes.tsx` | — | — |

Shared components (`src/components/`): `AppHeader` (logo → Home, Home / My Trees
nav, account menu), `CreateTreeModal` (landing + My Trees), `Dialog` and
`ConfirmDialog` (modal shell matching the "Request a change" modal `12:18`).

| Tree workspace section | Who sees it | Backend |
| --- | --- | --- |
| `FamilyTreeToolbarSection` | everyone; Owner: Add Member, Add Relationship, Review Requests, Invite Link. Collaborator: Request Change | tree name/role/count; tree switcher uses `GET /api/trees/` |
| `FamilyTreeCanvasSection` + `familyTreeLayout.ts` | everyone | members + relationships |
| `MemberDetailsDialogSection` | everyone; Owner also gets Edit / Add relationship / Delete / Remove relationship | `GET /members/:id/` |
| `MemberFormDialog` | Owner | `POST /members/`, `PATCH /members/:id/` |
| `RelationshipFormDialog` | Owner | `POST /relationships/` |
| `ConfirmDialog` (delete person / relationship) | Owner | `DELETE /members/:id/`, `DELETE /relationships/:id/` |
| `ReviewRequestsDialog` | Owner | `GET /suggestions/`, `POST /suggestions/:id/approve|reject/` |
| `InviteDialog` | Owner | `POST /invitations/`; lists and revokes links (`GET /invitations/`, `DELETE /invitations/:id/`) |
| `ChangeRequestModalSection` | Collaborator | `POST /suggestions/` (`ADD_MEMBER`, `ADD_RELATIONSHIP`) |
| `MemberSearch` (toolbar) | everyone | `GET /api/search/?q=&tree=` (FR-15) |
| `TreeSettingsMenu`, `EditTreeDialog`, `DeleteTreeDialog` (`src/components/TreeSettings/`; also on My Trees cards) | Owner | `PATCH`/`DELETE /api/trees/:id/` (FR-23, proposed) |
| `MyContributionsDialog` | Collaborator | `GET /suggestions/?status=&page=`, `PATCH /suggestions/:id/`, `POST /suggestions/:id/withdraw/` (FR-24, proposed) |
| `MemberProposalDialog` | Collaborator | `POST /suggestions/` (`UPDATE_MEMBER`); edits pending member suggestions |
| `DocumentSuggestionDialog` | Collaborator | `POST /suggestions/` multipart (`ADD_MEDIA`) |
| Person details: photo / documents | Owner | `PUT`/`DELETE /members/:id/photo/`, `POST`/`DELETE /members/:id/documents/` |

Django enforces every role rule on its own (`trees/permissions.py`): writes to
members/relationships/invitations are Owner-only (403 for Collaborators),
suggestions can only be submitted by Collaborators and reviewed by the Owner,
and users outside a tree get 404 for all of its endpoints.

## How the visualizer works

`familyTreeLayout.ts` is pure (no React) and unit-tested:

1. **Generations.** Parent/adoptive-parent links put the child at least one row
   below every parent; spouse and sibling links put both people on the same row.
   The rules are relaxed until nothing moves (capped, so bad data can't loop).
2. **Rows.** Each row is split into blocks: a person plus everyone they're
   married to on that row (so couples, and people married more than once, stay
   side by side). A block wants to sit under its members' parents; blocks are
   then pushed apart so cards never overlap, and the row is shifted to best fit.
3. **Connectors.** Rounded orthogonal paths. When a child's two parents are a
   couple side by side, one line drops from their marriage marker; otherwise
   each parent connects separately (single parents, unmarried co-parents).
   Adoptive links are dashed. Explicit siblings who share no parent in the
   tree get a dotted bracket. Nothing depends on gender.

Node identity and React keys are database ids. The canvas pans (drag, wheel,
arrow keys), zooms (buttons, Ctrl/⌘ + wheel or trackpad pinch, two-finger
touch pinch, +/-) and fits to screen
(button or 0). It fits once when a tree first has members; after edits it keeps
the current view.

## Authentication

- `src/auth/AuthProvider.tsx` checks `GET /api/me/` once per page load. A valid
  Django session cookie means the user is never asked to sign in again.
- `RequireAuth` guards `/family-tree`. Anonymous users go to `/sign-in` with
  `{ from }` in router state and come back there after signing in.
- Create Tree while signed out goes to `/sign-in` with `intent: "create-tree"`;
  after sign-in the landing page reopens the Create Your Tree dialog.
- Google popup completion: Django's `SecurityMiddleware` sends
  `Cross-Origin-Opener-Policy: same-origin`, so the popup (`:8000`) is cut off
  from this window (`:5173`). `window.opener` is `null` on
  `/accounts/popup-complete/` and its `postMessage` never arrives. The sign-in
  section therefore also polls `GET /api/me/` (and re-checks on window focus)
  while the popup is open. `postMessage` from `VITE_BACKEND_ORIGIN` is still
  accepted when a browser delivers it.
- `VITE_BACKEND_ORIGIN` (default `http://localhost:8000`) sets the popup URL
  and the trusted `postMessage` origin.

## Cleanup audit (state before the cleanup)

| File | Active route | Imported by | What it actually did | Interactions worked? | Data | Recommendation | Reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Wireframe/RootsHome.tsx` | `/` | `index.tsx` | Landing + Create Tree modal | Yes, but Create Tree needed a session it never checked | Real (`POST /api/trees/`) | REFACTOR → `Landing/LandingScreen` | Add auth gate, intent resume, open the created tree |
| `Wireframe/sections/HeaderSection` | — | `RootsHome` | Logo, title, Sign In link | Sign In link only | Static | REFACTOR → `LandingHeaderSection` | Show Sign Out when signed in |
| `Wireframe/sections/LandingHeroSection`, `CreateTreeModalSection` | — | `RootsHome` | Intro, dialog | Yes | Real | KEEP (moved to `Landing/`) | Working |
| `Wireframe/Wireframe.tsx` (+ `index.ts`) | none | nothing | "Kinship" Anderson dashboard | Local state only | Hardcoded Anderson family | REMOVE | Different product name, fake data, no route, no tests |
| `Wireframe/sections/FooterSection` | none | only a commented-out import | Footer | — | Static | REMOVE | Unused |
| `RootsSignIn/RootsSignIn.tsx` | `/sign-in` | `index.tsx` | Sign-in page | Partly | — | REFACTOR → `SignIn/SignInScreen` | Skip when signed in; return to `from` |
| `RootsSignIn/sections/FamilyTreeAuthenticationSection` | — | `RootsSignIn` | Real Google OAuth popup | Popup opened; completion never reached the page (COOP), then `alert()` + hard reload to `/` | Real (`/api/accounts/profile/`) | REFACTOR → `GoogleSignInSection` | Keep the OAuth flow; add session check, intent resume, inline errors; use `/api/me/` |
| `RootsSignIn/sections/BrandHeaderSection` | — | `RootsSignIn` | Header + Back to home | Yes | Static | KEEP (moved) | Working |
| `RootsSignIn/sections/FooterSection` | none | commented out | Footer | — | Static | REMOVE | Unused |
| `RootsGoogleSignIn/*` | none | `RootsAddPerson` (itself unused) | Figma mock of Google's account chooser | Picked fake accounts; Apple button did nothing | Fake accounts ("Alex Johnson", "Taylor Morgan") | REMOVE | Not the real OAuth popup; fake identities |
| `RootsFamilyTree/RootsFamilyTree.tsx` | `/family-tree` | `index.tsx` | Header, toolbar, empty dotted area | Request Change opened modal | None ("0 people") | REFACTOR → `FamilyTree/FamilyTreeScreen` | Load the real tree; require sign-in |
| `RootsFamilyTree/sections/FamilyTreeCanvasSection` | — | **nothing** | Bennett family canvas | Zoom buttons changed a number but never zoomed; fullscreen worked; no pan | 17 hardcoded people, stock portraits, one static SVG of lines | REFACTOR | Keep card/legend/control design and fullscreen; lay out real members; make zoom real |
| `RootsFamilyTree/sections/AppHeaderSection` | — | `RootsFamilyTree` | Logo, nav, account menu | Menu opened; Sign out did nothing; Profile → `/profile` (no route) | "?" avatar | REFACTOR | Real initials, working sign-out, dead Profile link removed |
| `RootsFamilyTree/sections/FamilyTreeToolbarSection` | — | `RootsFamilyTree` | Title, stats, buttons | Request Change only | Hardcoded "Your Family Tree", "0 people" | REFACTOR | Real name/count; disabled for owners (backend: Collaborators only) |
| `RootsAddPerson/sections/AddPersonRequestModalSection` | — | `RootsFamilyTree` | Add member / relationship request form | UI only; submit showed "Request is ready for the SuggestRequest API." and sent nothing | Member list always empty | REFACTOR → `ChangeRequestModalSection` | Wire to `POST /suggestions/`; birth date optional (nullable in DB) |
| `RootsAddPerson/RootsAddPerson.tsx` (+ sections) | none | nothing | Figma frame of tree + modal | — | Hardcoded | REMOVE | Inline copies of components that live elsewhere |
| `RootsJamesBennett/*` | none | nothing | Bennett tree + person-details dialog | Local state only | Hardcoded Bennett family, portraits, "SAMPLE RECORD" documents | REFACTOR then REMOVE | Person-details design → `MemberDetailsDialogSection` with real data |
| `RootsJamesBennettScreen/*` | none | nothing | Another Bennett tree + profile/documents panel | Upload input never uploaded | Hardcoded | REMOVE | Same as above; nothing else reusable |
| `static/img/*` (79 files) | — | only the removed screens | Portraits, ~33 copies of one heart icon, Figma vector exports | — | — | REMOVE | Unreferenced after the cleanup |

## Known gaps

- Collaborators can request **Add member** and **Add relationship**. The backend
  also supports **Update member** and **Add document** requests (and the review
  screen displays them), but there is no form for them yet.
- No photo or document upload UI yet (endpoints exist).
- Deleting a member also deletes suggestions that targeted them, including the
  approved one that created them (`SuggestRequest.target_member` is CASCADE).
- Pending invitation links can't be listed or revoked from the UI yet
  (`GET /invitations/`, `DELETE /invitations/:id/` exist).
