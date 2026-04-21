/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HERMES_BASE_URL?: string
  readonly VITE_DEV_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
