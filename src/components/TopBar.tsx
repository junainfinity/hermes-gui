import type { ReactNode } from 'react'
import { Icon, Logo } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { Avatar } from './Avatar'
import type { RouteName } from '@/types'

export function TopBar(): ReactNode {
  const s = useStore()
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderBottom: '1px solid var(--line-soft)',
        background: 'color-mix(in oklab, var(--paper) 85%, transparent)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      <button className="btn btn-icon btn-ghost" onClick={s.toggleLeftPanel} aria-label="toggle sidebar">
        <Icon name="sidebar" size={16} />
      </button>

      <div className="row gap-2" style={{ flexShrink: 0, alignItems: 'center' }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: 'var(--ink)',
            color: 'var(--paper)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Logo size={18} />
        </div>
        <div className="col">
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}>Hermes</div>
          <div className="t-xs c-3" style={{ lineHeight: 1.2, marginTop: 2 }}>
            {s.state.settings.provider || 'not connected'}
          </div>
        </div>
      </div>

      <div className="vr" style={{ height: 20, margin: '0 4px' }} />

      <nav className="row gap-1">
        <NavButton name="home" label="Home" icon="home" />
        <NavButton name="chat" label="Chat" icon="chat" />
        <NavButton name="sessions" label="Sessions" icon="history" />
        <NavButton name="skills" label="Skills" icon="puzzle" />
        <NavButton
          name="background"
          label="Background"
          icon="bolt"
          badge={s.state.bgTasks.filter((t) => t.status === 'running').length}
        />
      </nav>

      <div style={{ flex: 1 }} />

      <button
        className="input"
        onClick={s.openCmd}
        style={{ minWidth: 280, maxWidth: 360, cursor: 'pointer', background: 'var(--paper-2)' }}
        aria-label="open command palette"
      >
        <Icon name="search" size={14} className="c-3" />
        <span className="c-3 t-sm truncate" style={{ flex: 1, textAlign: 'left' }}>
          Search, run, /command, resume…
        </span>
        <span className="kbd">⌘K</span>
      </button>

      <button
        className="btn btn-ghost btn-icon has-tip"
        onClick={() => {
          s.toast('No new notifications')
        }}
        aria-label="notifications"
      >
        <Icon name="bell" size={16} />
      </button>
      <button
        className={`btn btn-ghost btn-icon has-tip ${s.state.voiceOn ? 'active' : ''}`}
        onClick={s.toggleVoice}
        aria-label={s.state.voiceOn ? 'voice on' : 'voice off'}
      >
        <Icon name={s.state.voiceOn ? 'mic' : 'mic_off'} size={16} style={s.state.voiceOn ? { color: 'var(--accent)' } : {}} />
      </button>
      <button
        className="btn btn-ghost btn-icon has-tip"
        onClick={() => {
          s.setSetting('dark', !s.state.settings.dark)
        }}
        aria-label="toggle theme"
      >
        <Icon name={s.state.settings.dark ? 'sun' : 'moon'} size={16} />
      </button>
      <button className="btn btn-ghost btn-icon" onClick={() => { s.navigate('settings') }} aria-label="settings">
        <Icon name="cog" size={16} />
      </button>
      <div className="vr" style={{ height: 20, margin: '0 2px' }} />
      <Avatar letter="a" size={28} tone="accent" />
    </header>
  )
}

interface NavButtonProps {
  name: RouteName
  label: string
  icon: string
  badge?: number
}

function NavButton({ name, label, icon, badge }: NavButtonProps): ReactNode {
  const s = useStore()
  const active = s.state.route.name === name
  return (
    <button
      className={`btn btn-sm ${active ? 'active' : 'btn-ghost'}`}
      onClick={() => {
        s.navigate(name)
      }}
      style={{ position: 'relative' }}
    >
      <Icon name={icon} size={14} />
      <span>{label}</span>
      {badge ? (
        <span className="pill pill-accent" style={{ fontSize: 10, padding: '0 5px', marginLeft: 2 }}>
          {badge}
        </span>
      ) : null}
    </button>
  )
}
