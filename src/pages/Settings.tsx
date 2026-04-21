import { useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { SectionHeader } from '@/components/SectionHeader'
import { Avatar } from '@/components/Avatar'
import { clearAuth } from '@/client/auth'
import type { Connectors, Density, Reasoning, Settings } from '@/types'

type Tab = 'model' | 'voice' | 'connectors' | 'personality' | 'context' | 'appearance' | 'account'

const TABS: [Tab, string, string][] = [
  ['model', 'Model & profile', 'brain'],
  ['voice', 'Voice & input', 'mic'],
  ['connectors', 'Connectors', 'plug'],
  ['personality', 'Personality', 'sparkle'],
  ['context', 'Context & compression', 'chart'],
  ['appearance', 'Appearance', 'sun'],
  ['account', 'Account', 'user'],
]

export function SettingsPage(): ReactNode {
  const [tab, setTab] = useState<Tab>('model')
  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
        <aside className="col gap-1">
          <SectionHeader title="Settings" size="sm" />
          {TABS.map(([k, l, ic]) => (
            <button
              key={k}
              className={`btn btn-sm ${tab === k ? 'active' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start' }}
              onClick={() => { setTab(k) }}
            >
              <Icon name={ic} size={13} /> {l}
            </button>
          ))}
        </aside>
        <div>
          {tab === 'model' && <SettingsModel />}
          {tab === 'voice' && <SettingsVoice />}
          {tab === 'connectors' && <SettingsConnectors />}
          {tab === 'personality' && <SettingsPersonality />}
          {tab === 'context' && <SettingsContext />}
          {tab === 'appearance' && <SettingsAppearance />}
          {tab === 'account' && <SettingsAccount />}
        </div>
      </div>
    </div>
  )
}

function Field({ label, desc, children }: { label: ReactNode; desc?: string; children: ReactNode }): ReactNode {
  return (
    <div className="row gap-4" style={{ padding: '16px 0', borderBottom: '1px solid var(--line-soft)', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div className="fw-600" style={{ fontSize: 13 }}>{label}</div>
        {desc && <div className="t-sm c-3" style={{ marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ minWidth: 240, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {children}
      </div>
    </div>
  )
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}): ReactNode {
  return (
    <select
      value={value}
      onChange={(e) => { onChange(e.target.value as T) }}
      className="input"
      style={{ padding: '6px 8px', cursor: 'pointer', minWidth: 220 }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function SettingsModel(): ReactNode {
  const s = useStore()
  const modelOptions = s.state.models.map((m) => ({
    value: m.id,
    label: `${m.label}  ·  ${m.ctx}  ·  ${m.cost}`,
  }))
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Model & profile</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>
        Default model used for new sessions.
      </p>
      <Field label="Primary model">
        <Select
          value={s.state.settings.model}
          onChange={(v) => { s.setSetting('model', v) }}
          options={modelOptions}
        />
      </Field>
      <Field label="Fallback model" desc="Used when the primary is rate-limited or unavailable.">
        <Select
          value={s.state.settings.fallback}
          onChange={(v) => { s.setSetting('fallback', v) }}
          options={modelOptions}
        />
      </Field>
      <Field label="Reasoning effort" desc="Higher = more deliberate thinking; slower, more expensive.">
        <div className="row gap-1">
          {(['low', 'medium', 'high'] satisfies Reasoning[]).map((k) => (
            <button
              key={k}
              className={`btn btn-sm ${s.state.settings.reasoning === k ? 'active' : 'btn-outline'}`}
              onClick={() => { s.setSetting('reasoning', k) }}
            >
              {k}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Temperature" desc={`Current: ${s.state.settings.temperature.toString()}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={s.state.settings.temperature}
          onChange={(e) => { s.setSetting('temperature', Number(e.target.value)) }}
          style={{ width: 200 }}
        />
      </Field>
    </div>
  )
}

function SettingsVoice(): ReactNode {
  const s = useStore()
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Voice & input</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>
        Browser-side speech recognition. Uses the Web Speech API.
      </p>
      <Field label="Voice mode" desc="Press ⌃B to toggle.">
        <div
          className={`toggle ${s.state.voiceOn ? 'on' : ''}`}
          onClick={s.toggleVoice}
          role="switch"
          aria-checked={s.state.voiceOn}
        />
      </Field>
    </div>
  )
}

function SettingsConnectors(): ReactNode {
  const s = useStore()
  const list: [keyof Connectors, string, string, string][] = [
    ['terminal', 'Terminal', 'Run shell commands in a sandbox.', 'terminal'],
    ['web', 'Web search', 'Search the open web.', 'globe'],
    ['files', 'Files', 'Read & edit local project files.', 'folder'],
    ['github', 'GitHub', 'Issues, PRs, reviews.', 'github'],
    ['slack', 'Slack', 'Post & summarize.', 'chat'],
    ['gmail', 'Gmail', 'Triage & draft.', 'chat'],
  ]
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Connectors</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>What the agent is allowed to touch.</p>
      {list.map(([k, l, d, ic]) => (
        <Field
          key={k}
          label={
            <span className="row gap-2">
              <Icon name={ic} size={13} />
              {l}
            </span>
          }
          desc={d}
        >
          <div
            className={`toggle ${s.state.settings.connectors[k] ? 'on' : ''}`}
            onClick={() => { s.setConnector(k, !s.state.settings.connectors[k]) }}
            role="switch"
            aria-checked={s.state.settings.connectors[k]}
          />
        </Field>
      ))}
    </div>
  )
}

function SettingsPersonality(): ReactNode {
  const s = useStore()
  const list = s.state.personalities.length
    ? s.state.personalities
    : [
        { id: 'concise', label: 'concise', desc: 'short, direct answers; no fluff.' },
        { id: 'playful', label: 'playful', desc: 'casual tone, comfortable with banter.' },
      ]
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Personality</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 16px' }}>Conversational style.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {list.map((p) => (
          <div
            key={p.id}
            className="card interactive"
            style={{
              padding: 12,
              borderColor: s.state.settings.personality === p.id ? 'var(--accent)' : undefined,
              background: s.state.settings.personality === p.id ? 'var(--accent-soft)' : undefined,
            }}
            onClick={() => { s.setSetting('personality', p.id) }}
          >
            <div className="row gap-2" style={{ marginBottom: 4 }}>
              <span className="fw-600">{p.label}</span>
              {s.state.settings.personality === p.id && (
                <Icon name="check" size={13} className="c-acc" style={{ marginLeft: 'auto' }} />
              )}
            </div>
            <div className="t-sm c-3">{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsContext(): ReactNode {
  const s = useStore()
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Context & compression</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>
        Automatic summarization to reclaim context.
      </p>
      <Field
        label="Auto-compress threshold"
        desc={`Summarize middle turns when context passes ${s.state.settings.compressionThreshold.toString()}%.`}
      >
        <input
          type="range"
          min="30"
          max="90"
          step="5"
          value={s.state.settings.compressionThreshold}
          onChange={(e) => { s.setSetting('compressionThreshold', Number(e.target.value)) }}
          style={{ width: 200 }}
        />
      </Field>
      <Field label="Summary model" desc="Cheap & fast is usually right.">
        <Select
          value={s.state.settings.compressionModel}
          onChange={(v) => { s.setSetting('compressionModel', v) }}
          options={s.state.models.map((m) => ({ value: m.id, label: m.label }))}
        />
      </Field>
    </div>
  )
}

function SettingsAppearance(): ReactNode {
  const s = useStore()
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Appearance</h3>
      <Field label="Theme">
        <div className="row gap-1">
          <button
            className={`btn btn-sm ${!s.state.settings.dark ? 'active' : 'btn-outline'}`}
            onClick={() => { s.setSetting('dark', false) }}
          >
            <Icon name="sun" size={12} /> Light
          </button>
          <button
            className={`btn btn-sm ${s.state.settings.dark ? 'active' : 'btn-outline'}`}
            onClick={() => { s.setSetting('dark', true) }}
          >
            <Icon name="moon" size={12} /> Dark
          </button>
        </div>
      </Field>
      <Field label="Density">
        <div className="row gap-1">
          {(['compact', 'cozy', 'comfortable'] satisfies Density[]).map((k) => (
            <button
              key={k}
              className={`btn btn-sm ${s.state.settings.density === k ? 'active' : 'btn-outline'}`}
              onClick={() => { s.setSetting('density', k) }}
            >
              {k}
            </button>
          ))}
        </div>
      </Field>
    </div>
  )
}

function SettingsAccount(): ReactNode {
  const s = useStore()
  const maskedKey = s.auth.apiKey ? s.auth.apiKey.slice(0, 8) + '…' + s.auth.apiKey.slice(-4) : '—'
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Account</h3>
      <Field label="Signed in as">
        <div className="row gap-2">
          <Avatar letter="a" size={24} tone="accent" />
          <span className="fw-500">local user</span>
        </div>
      </Field>
      <Field label="API key" desc="Rotate by restarting Hermes with a new API_SERVER_KEY.">
        <code className="mono t-sm c-3">{maskedKey}</code>
      </Field>
      <Field label="Sign out">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => {
            clearAuth()
            window.location.reload()
          }}
        >
          <Icon name="logout" size={12} /> Sign out
        </button>
      </Field>
    </div>
  )
}

export type { Settings }
