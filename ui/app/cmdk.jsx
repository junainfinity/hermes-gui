// Hermes App — Command Palette (⌘K). Fuzzy search sessions, skills, slash commands, nav.

function CommandPalette() {
  const s = useStore();
  const [q, setQ] = React.useState('');
  const [sel, setSel] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (s.state.commandOpen) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 30); }
  }, [s.state.commandOpen]);

  // build combined result list
  const results = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (t) => !term || t.toLowerCase().includes(term);

    const nav = [
      { kind: 'nav', icon: 'home',    title: 'Go to Home',       hint: 'dashboard',    run: () => s.navigate('home') },
      { kind: 'nav', icon: 'chat',    title: 'Go to Chat',       hint: 'current session', run: () => s.navigate('chat') },
      { kind: 'nav', icon: 'history', title: 'Browse sessions',  hint: 'history',      run: () => s.navigate('sessions') },
      { kind: 'nav', icon: 'puzzle',  title: 'Skills hub',       hint: 'install, pin', run: () => s.navigate('skills') },
      { kind: 'nav', icon: 'bolt',    title: 'Background tasks', hint: 'what\'s running', run: () => s.navigate('background') },
      { kind: 'nav', icon: 'cog',     title: 'Open settings',    hint: 'model, voice, budget', run: () => s.navigate('settings') },
    ].filter(r => match(r.title + ' ' + r.hint));

    const sessions = s.state.sessions
      .filter(se => match(se.title))
      .slice(0, 6)
      .map(se => ({
        kind: 'session', icon: 'history',
        title: se.title,
        hint: `${relTime(se.updated)} · ${se.model} · ${se.msgCount} msgs`,
        badge: se.live ? 'live' : (se.pinned ? 'pinned' : null),
        run: () => s.openSession(se.id),
      }));

    const isSlash = term.startsWith('/');
    const slash = SEED_SLASH
      .filter(c => match(c.cmd) || (isSlash && c.cmd.slice(1).startsWith(term.slice(1))))
      .slice(0, 6)
      .map(c => ({
        kind: 'command', icon: 'slash', title: c.cmd, hint: c.desc,
        run: () => {
          if (c.cmd === '/voice')     s.toggleVoice();
          else if (c.cmd === '/skills')   s.navigate('skills');
          else if (c.cmd === '/background') s.navigate('background');
          else if (c.cmd === '/model')    s.navigate('settings');
          else if (c.cmd === '/resume')   s.navigate('sessions');
          else s.toast(`ran ${c.cmd}`);
        },
      }));

    const skills = s.state.skills
      .filter(sk => match(sk.name + ' ' + sk.desc))
      .slice(0, 4)
      .map(sk => ({
        kind: 'skill', icon: 'puzzle',
        title: sk.name,
        hint: sk.desc,
        badge: sk.installed ? (sk.pinned ? 'pinned' : 'installed') : 'install',
        run: () => {
          if (!sk.installed) { s.toggleSkillInstalled(sk.id); s.toast(`installed ${sk.name}`); }
          else s.navigate('skills');
        },
      }));

    const actions = [
      { kind: 'action', icon: 'plus', title: 'New session', hint: 'start a fresh chat', kbd: '⌘N', run: () => s.newSession() },
      { kind: 'action', icon: 'zap',  title: q.trim() ? `Run in background: "${q.trim()}"` : 'Run in background', hint: '/background', run: () => { if (q.trim()) { s.addBgTask(q.trim()); s.toast('queued to background'); s.closeCmd(); } else s.navigate('background'); } },
      { kind: 'action', icon: 'moon', title: `Toggle theme (${s.state.settings.dark ? 'light' : 'dark'})`, hint: 'appearance', run: () => s.setSetting('dark', !s.state.settings.dark) },
    ].filter(a => match(a.title + ' ' + a.hint));

    const groups = [];
    if (actions.length)  groups.push({ label: 'Actions',  items: actions });
    if (slash.length)    groups.push({ label: 'Commands', items: slash });
    if (sessions.length) groups.push({ label: 'Sessions', items: sessions });
    if (skills.length)   groups.push({ label: 'Skills',   items: skills });
    if (nav.length)      groups.push({ label: 'Navigate', items: nav });
    return groups;
  }, [q, s.state.sessions, s.state.skills, s.state.settings.dark]);

  const flat = results.flatMap(g => g.items);

  const onKey = (e) => {
    if (e.key === 'Escape') { s.closeCmd(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(x => Math.min(flat.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(x => Math.max(0, x - 1)); }
    else if (e.key === 'Enter')     { e.preventDefault(); flat[sel]?.run(); s.closeCmd(); }
  };

  if (!s.state.commandOpen) return null;

  let idx = 0;
  return (
    <div className="fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'color-mix(in oklab, var(--ink) 35%, transparent)',
      backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'start center', paddingTop: '12vh',
    }} onClick={s.closeCmd}>
      <div className="slide-up" onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, calc(100vw - 40px))',
          background: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
        }}>
        {/* search */}
        <div className="row gap-2" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)' }}>
          <Icon name="search" size={16} className="c-3" />
          <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey}
            placeholder="Ask, run, /command, resume a session…"
            style={{ flex: 1, fontSize: 15, background: 'transparent', color: 'var(--ink)' }} />
          <span className="kbd">esc</span>
        </div>

        {/* results */}
        <div className="scroll" style={{ maxHeight: 420, padding: 6 }}>
          {flat.length === 0 && (
            <div className="col gap-2" style={{ padding: '30px 20px', alignItems: 'center', color: 'var(--ink-3)' }}>
              <Icon name="search" size={24} />
              <div className="t-sm">No results for "{q}"</div>
              {q.trim() && (
                <button className="btn btn-outline btn-sm" onClick={() => { s.addBgTask(q.trim()); s.toast('queued to background'); s.closeCmd(); }}>
                  <Icon name="zap" size={12} /> Run "{q.slice(0, 28)}…" as background task
                </button>
              )}
            </div>
          )}
          {results.map((g) => (
            <div key={g.label} style={{ marginTop: 4 }}>
              <div className="uppercase t-xs c-4" style={{ padding: '6px 10px 2px', fontWeight: 600 }}>{g.label}</div>
              {g.items.map((r) => {
                const i = idx++;
                const on = i === sel;
                return (
                  <div key={i} onMouseEnter={() => setSel(i)}
                    onClick={() => { r.run(); s.closeCmd(); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 6, margin: '1px 4px',
                      background: on ? 'var(--paper-2)' : 'transparent',
                      cursor: 'pointer',
                    }}>
                    <Icon name={r.icon} size={15} className={on ? 'c-1' : 'c-3'} />
                    <span className="fw-500 truncate" style={{ fontSize: 13 }}>{r.title}</span>
                    {r.hint && <span className="t-sm c-4 truncate" style={{ flex: 1 }}>· {r.hint}</span>}
                    {r.badge && <span className={`pill ${r.badge === 'live' ? 'pill-accent' : ''}`}>{r.badge === 'live' && <span className="dot live" />}{r.badge}</span>}
                    {r.kbd && <span className="kbd">{r.kbd}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="row gap-3" style={{ padding: '8px 14px', borderTop: '1px solid var(--line-soft)', fontSize: 11, color: 'var(--ink-3)', background: 'var(--paper-1)' }}>
          <span className="row gap-1"><span className="kbd">↑↓</span> navigate</span>
          <span className="row gap-1"><span className="kbd">↵</span> select</span>
          <span className="row gap-1"><span className="kbd">/</span> slash</span>
          <div style={{ flex: 1 }} />
          <span>{flat.length} result{flat.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CommandPalette });
