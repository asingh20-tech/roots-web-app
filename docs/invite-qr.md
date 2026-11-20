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

## Revision: recoverable invitation links (SA-2 amended)

Previous design: only `token_hash` (SHA-256) was stored, so a link's URL could
be shown once, at creation. Reopening the dialog left active links that could
not be copied or turned into a QR code.

Revised design (enabled only when `INVITATION_TOKEN_KEY` is set):

- Validation is unchanged. `/api/invite/<token>/` still looks invitations up
  by `token_hash`; seven-day expiry, multi-use links and revocation are unchanged.
- New invitations also store `token_ciphertext`: version byte, 96-bit random
  nonce and AES-256-GCM ciphertext of the raw token (`trees/invite_crypto.py`,
  using the existing `cryptography` dependency). The associated data binds the
  ciphertext to its tree ID and token hash. A copied ciphertext fails to decrypt
  in another row. After decryption the token must hash back to `token_hash`.
- The key is 32 random bytes, URL-safe base64, from the `INVITATION_TOKEN_KEY`
  environment variable. It is separate from `DJANGO_SECRET_KEY`, and the system
  check `trees.E001/E002` rejects a malformed key or a reused one. Generate one with
  `python -c "import base64,os;print(base64.urlsafe_b64encode(os.urandom(32)).decode())"`.
- Plaintext tokens are never stored. The list endpoint never returns URLs; it
  returns `link_available`. The URL comes only from
  `GET /api/trees/<tree>/invitations/<id>/link/`, which is limited to the Tree
  Owner. Collaborators get 403, outsiders get 404 and anonymous users get 401/403.
  This response and the create response send `Cache-Control: no-store`. Paths
  contain only numeric IDs, and error bodies contain no token material.
- Revoking a link sets `token_ciphertext` to NULL straight away. Expired links are
  purged when the owner lists or requests links, and by
  `manage.py purge_invitation_tokens`. Schedule that command (for example hourly)
  so expired ciphertext doesn't stay in idle trees.
- Without a key, nothing recoverable is stored and behaviour matches the old
  hash-only design. A URL can be copied only during the session that created it.
- Rotating or losing the key makes existing links unrecoverable. They still
  redeem, but the UI shows them as "original link unavailable". Links created
  before this change (migration 0006) can never be recovered.

Residual risk: someone who has both a database dump and `INVITATION_TOKEN_KEY`
can recover active invitation tokens. Store the key only in the deployment
secret store, never in the database or repository. The exposure window is the
link's seven-day lifetime.

Dialog behaviour: each card can be selected (`selectedInvitationId`). The
selected panel shows that link's own QR, URL field, Copy link, Copy QR, Download
QR and Revoke. Rows keep the quick actions: Copy link, View QR and Revoke. Active
cards are listed first, then expired and revoked history, newest first. URLs are
fetched on demand and cached in memory by ID. Late responses can't fill a
different selection, and expiry or revocation clears the URL and preview
immediately. No demo QR is rendered before a selection.
