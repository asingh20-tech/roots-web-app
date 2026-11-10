/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Origin Django is served from (OAuth popup + postMessage check).
  readonly VITE_BACKEND_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
