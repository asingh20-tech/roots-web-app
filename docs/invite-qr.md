# Invitation QR implementation

Branch: qrcode/tree-visual. Upstream commit:
c064f61f5adb6daf38450609c1adff937b08289d.
See frontend/src/vendor/magic-tree/PROVENANCE.md for source/license scope and the
unverified icqr lineage mentioned by upstream. No upstream media is distributed.

`npm run build` in frontend produces the main app, `invite-qr.html`, local renderer
chunks and license notices in the same dist directory. Deploy the entire directory;
serve `/invite-qr.html` as the real HTML asset before an SPA fallback. No separate
service or QR redemption route is needed. Existing HTTPS deployment rules apply.

InviteDialog owns raw links and PNG promises by invitation ID. They are discarded
on closure, revocation, or expiry. Old links remain manageable but cannot be
reconstructed. Copy starts in the user gesture and announces success only after
clipboard completion; download uses the same cached flat PNG. PNGs encode the
entire original URL with black modules, white background and four-module margin.

The separate React root uses upstream procedural WebGPU geometry, shaders, growth
and camera transition. A flat local image overlays the scene after flattening.
Unsupported GPU, initialization/device failure, a 12-second initialization timeout,
and reduced motion select the local flat preview. Removing the iframe releases
its browsing context; renderer cleanup additionally destroys the device and RAF.

Verification commands:
- frontend: `npm test`, `npx tsc -p tsconfig.app.json`, `npm run build`
- repository: `.venv/bin/python backend/manage.py test trees --noinput`

Final automated result: 86 frontend tests and 74 backend tests pass; TypeScript,
production build and git diff whitespace checks pass.

Automated tests cover exact decoding of two distinct PNG URL payloads, per-row
clipboard payloads/download IDs, delayed clipboard rejection, missing old URLs,
revocation, and backend reusable Collaborator redemption/rejection/access retention.
Desktop Chrome: actual WebGPU tree/tiled base and keyboard flat/tree controls
visually checked. No physical phone scan or touch-device test has been performed.
Mobile layout, actual OS image clipboard/download, reduced-motion system settings,
and closing during a real GPU initialization still need device acceptance checks.

Changed files:
- frontend/src/screens/FamilyTree/sections/InviteDialog/InviteDialog.tsx
- frontend/src/screens/FamilyTree/sections/InviteDialog/InviteQrPreview.tsx
- frontend/src/screens/FamilyTree/sections/InviteDialog/inviteQr.ts
- Three colocated invitation/preview/PNG test files
- frontend/src/invite-qr-embed.jsx and frontend/invite-qr.html
- frontend/src/vendor/magic-tree/{renderer.js,LICENSE,PROVENANCE.md}
- frontend/static/licenses/{magic-tree-qr.txt,qrcode.txt}
- frontend/vite.config.ts, frontend/package.json, frontend/package-lock.json
- backend/trees/tests.py (tests only; server behavior is unchanged)
- docs/invite-qr.md

Follow-up visual changes: the flat view now retains the upstream textured QR
instead of overlaying a plain QR. Tree camera scale increased from 37.7 to 48;
flat camera scale and preview card dimensions are unchanged. The renderer returns
a mature tree snapshot through the validated in-memory bridge. Copy/download use
a PNG invitation card containing that artwork and a crisp Roots-green QR. Where
WebGPU artwork is unavailable, the PNG remains a Roots-green flat QR. PNG files
are static images; they do not preserve animation or interactive camera controls.

Canopy framing correction: tree scale is now 45 (still larger than the original
37.7) and its vertical offset is -0.15 to provide headroom. The flat camera scale
and offset remain unchanged. Shared PNGs are static; an interactive recipient
experience requires a hosted web page reached by a link.
