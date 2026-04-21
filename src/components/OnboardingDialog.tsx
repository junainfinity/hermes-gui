import { useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'

export function OnboardingDialog(): ReactNode {
  const s = useStore()
  const [key, setKey] = useState('')
  if (!s.state.bootError) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'color-mix(in oklab, var(--ink) 35%, transparent)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-labelledby="onboarding-title"
        style={{
          width: 'min(560px, 100%)',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 28,
        }}
      >
        <div className="row gap-2" style={{ marginBottom: 14 }}>
          <Icon name="key" size={18} />
          <h2 id="onboarding-title" style={{ margin: 0, fontSize: 20 }}>
            Connect to Hermes
          </h2>
        </div>
        <p className="t-sm c-2" style={{ marginTop: 0, marginBottom: 14 }}>
          Hermes Web UI talks to a running <code>hermes gateway</code> over HTTP. Paste the API key
          you generated when you set <code>API_SERVER_KEY</code>.
        </p>
        {s.state.bootError && (
          <div
            className="card"
            style={{
              background: 'color-mix(in oklab, var(--red) 8%, transparent)',
              borderColor: 'color-mix(in oklab, var(--red) 40%, transparent)',
              padding: 10,
              marginBottom: 14,
              fontSize: 13,
              color: 'var(--red)',
            }}
          >
            {s.state.bootError}
          </div>
        )}
        <div className="col gap-2">
          <label htmlFor="api-key" className="t-xs c-3 uppercase fw-600">
            API key
          </label>
          <input
            id="api-key"
            className="input"
            type="password"
            value={key}
            onChange={(e) => {
              setKey(e.target.value)
            }}
            placeholder="sk-…"
            style={{ padding: '10px 12px', fontSize: 14, fontFamily: 'var(--font-mono)' }}
          />
        </div>
        <div className="row gap-2" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            disabled={!key.trim()}
            onClick={() => {
              s.setApiKey(key.trim())
            }}
          >
            Connect
          </button>
        </div>
        <div className="t-xs c-3" style={{ marginTop: 14 }}>
          Stored locally in your browser only. See{' '}
          <a href="https://github.com/arjun/hermes-webui/blob/main/DESIGN.md#7-auth" target="_blank" rel="noreferrer">
            DESIGN.md §7
          </a>{' '}
          for the auth model.
        </div>
      </div>
    </div>
  )
}
