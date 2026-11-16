# Magic Tree renderer provenance

Source: https://github.com/xscanzm/magic-tree-qr
Pinned commit: c064f61f5adb6daf38450609c1adff937b08289d
License: MIT, Copyright (c) 2026 xscanzm (LICENSE alongside this file).

The upstream repository is a standalone Vite app. Its main.jsx contains bundled,
partly obfuscated React/ReactDOM and QR encoder code plus procedural geometry,
WGSL shaders, and a WebGPU React hook. Roots extracts only the procedural geometry,
shaders, and renderer hook (upstream lines 16348–17207 and 18306–19109).
React and qrcode come from separately versioned npm packages, not the embedded
upstream bundles. No audio, favicon, logo, og-image, texture, font, or other upstream
media is included. Geometry and scene colors are generated in code.

Upstream README credits icqr (https://icqr.com) as inspiration; the repository does
not provide a detailed chain of authorship or separate icqr license. The MIT grant
is supplied by xscanzm; original authorship beyond that claim is not independently
verified. This uncertainty remains relevant before public distribution.

Local modifications: export the hook; use Roots React and qrcode dependencies;
replace the default brand URL with example.com; fail rather than silently encode
another URL; report initialization/device loss to the host; destroy GPU resources
on teardown and handle disposal during asynchronous initialization. The host uses
its own flat PNG instead of upstream screenshots. UI, URL editor/rewriter,
session persistence, social sharing, audio, and remote branding are excluded.

The embedded HTML uses a restrictive CSP with no network connections or remote
resources. Its URL is static. URL content arrives only through source/origin/type
validated postMessage. No raw invite URL is stored outside component memory.
License copies are published under /licenses/ by the existing Vite static build.

Follow-up: increased only the tree camera scale to 48 and enabled the upstream
snapshot callback to capture a mature tree at time 8/progress 0 for sharing.

Canopy framing correction: tree scale adjusted to 45 with vertical offset -0.15;
flat-view scale and offset are unchanged.
