/**
 * Auth / credential storage for the Hermes API.
 *
 * The bearer token is kept in localStorage. The "connected" state is the
 * combination of a present token and a successful `GET /health` call.
 */

const STORAGE_KEY = 'hermes-webui-auth-v1'

export interface AuthState {
  apiKey: string | null
  baseUrl: string
}

export function loadAuth(): AuthState {
  const envBase = import.meta.env.VITE_HERMES_BASE_URL
  const envKey = import.meta.env.VITE_DEV_API_KEY
  const fallback: AuthState = {
    apiKey: envKey ?? null,
    baseUrl: envBase ?? 'http://127.0.0.1:8642',
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const saved = JSON.parse(raw) as Partial<AuthState>
    return {
      apiKey: saved.apiKey ?? fallback.apiKey,
      baseUrl: saved.baseUrl ?? fallback.baseUrl,
    }
  } catch {
    return fallback
  }
}

export function saveAuth(state: AuthState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // quota exceeded / private mode — tolerate silently
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
