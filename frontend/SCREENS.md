# Frontend screens

Screen ↔ route ↔ Figma mapping, plus the audit behind the November 2026 cleanup.
Figma node IDs come from the `data-model-id` attributes Anima generated; "not
recorded" means the code never carried one, so none is guessed here.

## Active screens

| Screen (route) | File | Figma node | Data source |
| --- | --- | --- | --- |
| Landing (`/`) | `src/screens/Landing/LandingScreen.tsx` | not recorded (was `Wireframe/RootsHome.tsx`) | `GET /api/me/`, `POST /api/trees/` |
| Sign in (`/sign-in`) | `src/screens/SignIn/SignInScreen.tsx` | `73:2` | Django allauth Google popup, `GET /api/me/` |
| Family tree (`/family-tree?tree=<id>`, sign-in required) | `src/screens/FamilyTree/FamilyTreeScreen.tsx` | not recorded (was `RootsFamilyTree`) | `GET /api/trees/`, `/members/`, `/relationships/` |

| Section | Used by | Figma origin | Backend |
| --- | --- | --- | --- |
| `Landing/sections/LandingHeaderSection` | Landing | Landing header | `POST /api/logout/` (Sign Out) |
| `Landing/sections/LandingHeroSection` | Landing | Landing | — |
| `Landing/sections/CreateTreeModalSection` | Landing | Create Your Tree dialog | `POST /api/trees/` |
| `SignIn/sections/BrandHeaderSection` | Sign in | `73:2` | — |
| `SignIn/sections/GoogleSignInSection` | Sign in | `73:2` | `/accounts/google/login/` popup, `GET /api/me/` |
| `FamilyTree/sections/AppHeaderSection` | Family tree | Family tree header | `POST /api/logout/` |
| `FamilyTree/sections/FamilyTreeToolbarSection` | Family tree | Family tree toolbar | tree name / member count from API |
| `FamilyTree/sections/FamilyTreeCanvasSection` | Family tree | Bennett tree canvas (`29:1967`, `21:160`) | members + relationships |
| `FamilyTree/sections/MemberDetailsDialogSection` | Family tree | "Person details" (`29:1967`) | `GET /api/trees/:id/members/:id/` |
| `FamilyTree/sections/ChangeRequestModalSection` | Family tree | "Request a change" (`12:18`) | `POST /api/trees/:id/suggestions/` |

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

## Known gaps (not built in this cleanup)

- **Invite Link** and the **tree options** chevron in the toolbar have no
  handler yet (backend: `POST /api/trees/:id/invitations/`).
- Tree Owners can't add members from the UI. The backend's
  `POST /api/trees/:id/members/` exists; change requests are Collaborator-only.
- No screen yet for accepting an invitation link or reviewing suggestions.
