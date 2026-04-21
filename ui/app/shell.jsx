// Hermes App — shared layout shell: topbar, left sidebar, bottom status bar,
// status pills, avatars, toast. Pages slot into <main>.

function Avatar({ letter = 'a', size = 24, tone = 'ink' }) {
  const bg = tone === 'accent' ? 'var(--accent)'
           : tone === 'ink'    ? 'var(--ink)'
           : 'var(--paper-3)';
  const color = tone === 'paper' ? 'var(--ink)' : 'var(--paper)';
  return (
    <div style={{
      width: size, height: size, borderRadius: size, flexShrink: 0,
      background: bg, color, display: 'grid', placeItems: 'center',
      fontSize: size * 0.45, fontWeight: 600, letterSpacing: 0,
      fontFamily: 'var(--font-sans)',
    }}>{letter.toUpperCase()}</div>
  );
}

function LogoBlock({ size = 28 }) {
  return (
    <div className="row gap-2" style={{ alignItems: 'center' }}>
      <div style={{
        width: size, height: size, borderRadius: 8,
        background: 'var(--ink)', color: 'var(--paper)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
      }}>
        <Logo size={size * 0.7} />
      </div>
      <div className="col">
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 }}>Hermes</div>
        <div className="t-xs c-3" style={{ lineHeight: 1.2, marginTop: 2 }}>nous portal</div>
      </div>
    </div>
  );
}

// ── Top bar ──────────────────────────────────────────────────────────
function TopBar() {
  const s = useStore();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      borderBottom: '1px solid var(--line-soft)',
      background: 'color-mix(in oklab, var(--paper) 85%, transparent)',
      backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
    }}>
      <button className="btn btn-icon btn-ghost" onClick={s.toggleLeftPanel} aria-label="toggle sidebar">
        <Icon name="sidebar" size={16} />
      </button>

      <div className="row gap-2" style={{ flexShrink: 0 }}>
        <LogoBlock size={26} />
      </div>

      <div className="vr" style={{ height: 20, margin: '0 4px' }} />

      <nav className="row gap-1">
        <NavButton name="home"     label="Home"        icon="home" />
        <NavButton name="chat"     label="Chat"        icon="chat" />
        <NavButton name="sessions" label="Sessions"    icon="history" />
        <NavButton name="skills"   label="Skills"      icon="puzzle" />
        <NavButton name="background" label="Background" icon="bolt" badge={s.state.bgTasks.filter(t => t.status==='running').length} />
      </nav>

      <div style={{ flex: 1 }} />

      {/* Command bar trigger */}
      <button className="input" onClick={s.openCmd}
        style={{ minWidth: 280, maxWidth: 360, cursor: 'pointer', background: 'var(--paper-2)' }}>
        <Icon name="search" size={14} className="c-3" />
        <span className="c-3 t-sm truncate" style={{ flex: 1 }}>Search, run, /command, resume…</span>
        <span className="kbd">⌘K</span>
      </button>

      <button className="btn btn-ghost btn-icon has-tip" onClick={() => s.toast('No new notifications')}>
        <Icon name="bell" size={16} />
        <span className="tip">notifications</span>
      </button>
      <button className={`btn btn-ghost btn-icon has-tip ${s.state.voiceOn ? 'active' : ''}`} onClick={s.toggleVoice}>
        <Icon name={s.state.voiceOn ? 'mic' : 'mic_off'} size={16} style={{ color: s.state.voiceOn ? 'var(--accent)' : undefined }} />
        <span className="tip">{s.state.voiceOn ? 'voice on · ⌃B to record' : 'voice off'}</span>
      </button>
      <button className="btn btn-ghost btn-icon has-tip" onClick={() => s.setSetting('dark', !s.state.settings.dark)}>
        <Icon name={s.state.settings.dark ? 'sun' : 'moon'} size={16} />
        <span className="tip">toggle theme</span>
      </button>
      <button className="btn btn-ghost btn-icon" onClick={() => s.navigate('settings')}>
        <Icon name="cog" size={16} />
      </button>
      <div className="vr" style={{ height: 20, margin: '0 2px' }} />
      <Avatar letter="a" size={28} tone="accent" />
    </header>
  );
}

function NavButton({ name, label, icon, badge }) {
  const s = useStore();
  const active = s.state.route.name === name;
  return (
    <button className={`btn btn-sm ${active ? 'active' : 'btn-ghost'}`} onClick={() => s.navigate(name)}
      style={{ position: 'relative' }}>
      <Icon name={icon} size={14} />
      <span>{label}</span>
      {badge ? <span className="pill pill-accent" style={{ fontSize: 10, padding: '0 5px', marginLeft: 2 }}>{badge}</span> : null}
    </button>
  );
}

// ── Status bar (bottom) ─────────────────────────────────────────────
function StatusBar() {
  const s = useStore();
  const sess = s.state.sessions.find(x => x.id === s.state.activeSessionId);
  const running = s.state.bgTasks.filter(t => t.status === 'running').length;
  return (
    <footer style={{
      borderTop: '1px solid var(--line-soft)',
      background: 'var(--paper-1)',
      padding: '6px 14px',
      display: 'flex', alignItems: 'center', gap: 16,
      fontSize: 11, color: 'var(--ink-3)', flexShrink: 0,
      fontFamily: 'var(--font-mono)',
    }}>
      <span className="row gap-1"><span className="dot green" /> connected · {s.state.settings.provider}</span>
      <span>·</span>
      <span>{s.state.settings.model}</span>
      {sess && <>
        <span>·</span>
        <span>{fmtTokens(sess.tokens)} / 200K</span>
        <div className="progress" style={{ width: 70 }}><span style={{ width: sess.contextPct + '%' }} /></div>
        <span>{sess.contextPct}%</span>
        <span>·</span>
        <span>{fmtCost(sess.cost)}</span>
      </>}
      <span>·</span>
      <span>bg: {running} running</span>
      <div style={{ flex: 1 }} />
      <span>⌘K palette</span>
      <span>·</span>
      <span>⌃B voice</span>
      <span>·</span>
      <span>v4.2.0</span>
    </footer>
  );
}

// ── Toast ───────────────────────────────────────────────────────────
function Toast() {
  const s = useStore();
  if (!s.state.toast) return null;
  return (
    <div className="slide-up" style={{
      position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--paper)',
      padding: '8px 14px', borderRadius: 999, fontSize: 13, zIndex: 400,
      boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name="check" size={14} style={{ color: 'var(--accent)' }} />
      <span>{s.state.toast.msg}</span>
    </div>
  );
}

// Section header
function SectionHeader({ title, subtitle, right, size = 'lg' }) {
  return (
    <div className="row gap-3" style={{ alignItems: 'flex-end', marginBottom: 14 }}>
      <div className="col" style={{ flex: 1, minWidth: 0 }}>
        <h2 className="display" style={{
          margin: 0, fontSize: size === 'lg' ? 26 : 20,
          fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>{title}</h2>
        {subtitle && <div className="t-sm c-3" style={{ marginTop: 4 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { Avatar, LogoBlock, TopBar, StatusBar, Toast, SectionHeader, NavButton });
