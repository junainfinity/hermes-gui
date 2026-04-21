// Hermes App — Chat page: multi-tab chat with optional tool-stream right panel.

function ChatPage() {
  const s = useStore();
  const sess = s.state.sessions.find(se => se.id === s.state.activeSessionId);
  if (!sess) return <div style={{ padding: 40 }} className="c-3">No session selected.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: s.state.leftPanelCollapsed ? '0 1fr' : '260px 1fr', height: '100%', minHeight: 0 }}>
      {!s.state.leftPanelCollapsed && <ChatSidebar />}
      <div className="col" style={{ minWidth: 0, minHeight: 0 }}>
        <ChatTabs />
        <div style={{ display: 'grid', gridTemplateColumns: s.state.rightPanel === 'hidden' ? '1fr' : '1fr 340px', flex: 1, minHeight: 0 }}>
          <ChatMain sess={sess} />
          {s.state.rightPanel !== 'hidden' && <ChatRightPanel sess={sess} />}
        </div>
      </div>
    </div>
  );
}

// ─── Left sidebar: session list + active skills ─────────────────────
function ChatSidebar() {
  const s = useStore();
  const [q, setQ] = React.useState('');
  const grouped = React.useMemo(() => {
    const term = q.toLowerCase();
    const today = [], yest = [], older = [], arch = [];
    const filtered = s.state.sessions.filter(se => !term || se.title.toLowerCase().includes(term));
    filtered.forEach((se) => {
      if (se.archived) arch.push(se);
      else if (Date.now() - se.updated < 22 * 60 * 60 * 1000) today.push(se);
      else if (Date.now() - se.updated < 48 * 60 * 60 * 1000) yest.push(se);
      else older.push(se);
    });
    return { today, yest, older, arch };
  }, [q, s.state.sessions]);

  return (
    <aside style={{
      borderRight: '1px solid var(--line-soft)', background: 'var(--paper-1)',
      display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-soft)' }}>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => s.newSession()}>
          <Icon name="plus" size={13} /> New session
        </button>
        <div className="input" style={{ marginTop: 8, padding: '5px 8px' }}>
          <Icon name="search" size={13} className="c-3" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sessions…" style={{ fontSize: 12 }} />
        </div>
      </div>
      <div className="scroll" style={{ padding: 6 }}>
        <SessionGroup label="Today"     items={grouped.today} />
        <SessionGroup label="Yesterday" items={grouped.yest} />
        <SessionGroup label="Earlier"   items={grouped.older} />
        <SessionGroup label="Archived"  items={grouped.arch} />
      </div>
      <div style={{ padding: 10, borderTop: '1px solid var(--line-soft)' }}>
        <div className="uppercase t-xs c-4 fw-600" style={{ padding: '4px 6px 6px' }}>Active skills</div>
        <div className="col gap-1">
          {s.state.skills.filter(sk => sk.installed && sk.pinned).map(sk => (
            <div key={sk.id} className="row gap-2" style={{ padding: '5px 6px' }}>
              <Icon name="puzzle" size={12} className="c-3" />
              <span className="mono t-sm truncate flex-1">{sk.name}</span>
              <Icon name="check" size={11} style={{ color: 'var(--green)' }} />
            </div>
          ))}
          <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }} onClick={() => useStore().navigate('skills')}>
            <Icon name="plus" size={11} /> manage
          </button>
        </div>
      </div>
    </aside>
  );
}

function SessionGroup({ label, items }) {
  const s = useStore();
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div className="uppercase t-xs c-4 fw-600" style={{ padding: '4px 8px' }}>{label}</div>
      {items.map(se => (
        <button key={se.id}
          className={s.state.activeSessionId === se.id ? 'active' : ''}
          onClick={() => s.openSession(se.id)}
          style={{
            display: 'flex', gap: 8, alignItems: 'center', width: '100%',
            padding: '7px 8px', borderRadius: 6, textAlign: 'left',
            background: s.state.activeSessionId === se.id ? 'var(--paper-3)' : 'transparent',
            color: s.state.activeSessionId === se.id ? 'var(--ink)' : 'var(--ink-2)',
            fontSize: 13, cursor: 'pointer', border: 'none',
          }}
          onMouseEnter={(e) => { if (s.state.activeSessionId !== se.id) e.currentTarget.style.background = 'var(--paper-2)'; }}
          onMouseLeave={(e) => { if (s.state.activeSessionId !== se.id) e.currentTarget.style.background = 'transparent'; }}
        >
          {se.live ? <span className="dot live" /> : se.warn ? <Icon name="warn" size={11} style={{ color: 'var(--yellow)' }} /> : <Icon name="chat" size={11} className="c-3" />}
          <span className="truncate flex-1">{se.title}</span>
          {se.pinned && <Icon name="pin" size={10} className="c-acc" />}
          <span className="t-xs c-4" style={{ flexShrink: 0 }}>{se.contextPct}%</span>
        </button>
      ))}
    </div>
  );
}

// ─── Tabs bar ────────────────────────────────────────────────────────
function ChatTabs() {
  const s = useStore();
  const tabs = s.state.openTabs.map(id => s.state.sessions.find(se => se.id === id)).filter(Boolean);
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', height: 40,
      borderBottom: '1px solid var(--line-soft)',
      background: 'var(--paper-1)', overflow: 'hidden', flexShrink: 0,
    }}>
      <div className="row" style={{ overflow: 'auto', flex: 1 }}>
        {tabs.map(se => (
          <ChatTab key={se.id} sess={se} active={se.id === s.state.activeSessionId} />
        ))}
        <button className="btn btn-sm btn-ghost" onClick={() => s.newSession()} style={{ margin: '4px 6px' }}>
          <Icon name="plus" size={13} />
        </button>
      </div>
      <div className="row gap-1" style={{ padding: '0 8px', borderLeft: '1px solid var(--line-soft)' }}>
        <button className={`btn btn-sm ${s.state.rightPanel === 'tools' ? 'active' : 'btn-ghost'}`} onClick={() => s.setRightPanel(s.state.rightPanel === 'tools' ? 'hidden' : 'tools')}>
          <Icon name="tool" size={13} /> Tools
        </button>
        <button className={`btn btn-sm ${s.state.rightPanel === 'inspector' ? 'active' : 'btn-ghost'}`} onClick={() => s.setRightPanel(s.state.rightPanel === 'inspector' ? 'hidden' : 'inspector')}>
          <Icon name="info" size={13} /> Info
        </button>
      </div>
    </div>
  );
}

function ChatTab({ sess, active }) {
  const s = useStore();
  return (
    <div onClick={() => s.setActiveTab(sess.id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
        borderRight: '1px solid var(--line-soft)',
        background: active ? 'var(--paper)' : 'transparent',
        borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
        borderBottom: active ? '1px solid var(--paper)' : 'none',
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontSize: 12.5,
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        position: 'relative', marginBottom: -1,
      }}>
      {sess.live ? <span className="dot live" /> : <Icon name="chat" size={11} className="c-3" />}
      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{sess.title}</span>
      <button className="btn btn-ghost btn-icon btn-sm" style={{ width: 18, height: 18, padding: 0, marginLeft: 2 }}
        onClick={(e) => { e.stopPropagation(); s.closeTab(sess.id); }}>
        <Icon name="close" size={10} />
      </button>
    </div>
  );
}

// ─── Main chat column ────────────────────────────────────────────────
function ChatMain({ sess }) {
  const s = useStore();
  return (
    <div className="col" style={{ minWidth: 0, minHeight: 0, background: 'var(--paper)' }}>
      {/* Session header */}
      <div className="row gap-3" style={{ padding: '10px 20px', borderBottom: '1px solid var(--line-soft)', flexShrink: 0 }}>
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="row gap-2">
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }} className="truncate">{sess.title}</h2>
            {sess.live && <span className="pill pill-accent"><span className="dot live" /> live</span>}
            {sess.pinned && <Icon name="pin" size={12} className="c-acc" />}
          </div>
          <div className="row gap-2 t-xs c-3" style={{ marginTop: 3 }}>
            <span className="mono">{sess.model}</span>
            <span>·</span>
            <span>{sess.personality}</span>
            <span>·</span>
            <span>{sess.msgCount} messages</span>
            <span>·</span>
            <span>{relTime(sess.updated)}</span>
          </div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => s.updateSession(sess.id, { pinned: !sess.pinned })}>
          <Icon name="pin" size={13} /> {sess.pinned ? 'Unpin' : 'Pin'}
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => s.toast('exported')}>
          <Icon name="download" size={13} /> Export
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => s.toast('shared link copied')}>
          <Icon name="share" size={13} /> Share
        </button>
        <button className="btn btn-sm btn-ghost btn-icon">
          <Icon name="more_v" size={14} />
        </button>
      </div>

      {/* Messages */}
      <ChatMessages sess={sess} />

      {/* Composer */}
      <ChatComposer sess={sess} />
    </div>
  );
}

function ChatMessages({ sess }) {
  const scrollRef = React.useRef(null);
  React.useEffect(() => { scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight); }, [sess.messages.length]);

  return (
    <div ref={scrollRef} className="scroll" style={{ flex: 1, padding: '22px 20px 16px', minHeight: 0 }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }} className="col gap-4">
        {sess.messages.length === 0 && <EmptyChat sess={sess} />}
        {sess.messages.map((m, i) => <Message key={i} msg={m} />)}
        {sess.live && <ThinkingBubble />}
      </div>
    </div>
  );
}

function EmptyChat({ sess }) {
  return (
    <div className="col gap-3" style={{ padding: '60px 20px', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--paper-2)', display: 'grid', placeItems: 'center' }}>
        <Icon name="sparkle" size={22} className="c-3" />
      </div>
      <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>How can I help?</h3>
      <div className="t-sm c-3" style={{ maxWidth: 380 }}>
        Ask anything. Use <span className="kbd">/</span> for commands, <span className="kbd">@</span> to mention a file or skill.
      </div>
      <div className="row gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        {['Summarize my open PRs', 'Fix the flaky test in uploader', 'Write a changelog for this week', 'Explain this diff line-by-line'].map(p => (
          <button key={p} className="btn btn-outline btn-sm">{p}</button>
        ))}
      </div>
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
        <div style={{
          maxWidth: '78%', padding: '10px 14px',
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 14, borderBottomRightRadius: 4,
          fontSize: 14, lineHeight: 1.5,
        }}>{msg.text}</div>
      </div>
    );
  }
  return (
    <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
      <Avatar letter="H" size={28} tone="accent" />
      <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{msg.text}</div>
        {msg.tools && msg.tools.length > 0 && (
          <div className="card" style={{ background: 'var(--paper-1)', padding: '8px 10px' }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name="tool" size={12} className="c-3" />
              <span className="t-xs c-3 fw-600 uppercase">Tool calls</span>
            </div>
            <div className="col gap-1">
              {msg.tools.map((t, i) => (
                <div key={i} className="row gap-2" style={{ fontSize: 12 }}>
                  <Icon name={ICON_FOR_TOOL[t.tool] || 'tool'} size={11} className="c-3" />
                  <span className="mono c-2">{t.tool}</span>
                  <span className="c-3 mono truncate flex-1">{t.call}</span>
                  <span className="t-xs c-4 mono">{t.dur}s</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {msg.diff && (
          <div className="card" style={{ background: 'var(--paper-1)', padding: 10, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name="file" size={12} className="c-3" />
              <span className="mono c-2 truncate">src/auth/session.ts</span>
              <span className="pill pill-ghost" style={{ fontSize: 10 }}>diff · +12 −4</span>
            </div>
            <div className="col" style={{ gap: 0 }}>
              <DiffLine type="ctx"> export function validate(token: string) {'{'}</DiffLine>
              <DiffLine type="del">-  const payload = hmac.verify(token, SECRET);</DiffLine>
              <DiffLine type="add">+  const {'{'} payload, verified {'}'} = await pkce.exchange(token);</DiffLine>
              <DiffLine type="add">+  if (!verified) throw new AuthError('pkce_failed');</DiffLine>
              <DiffLine type="ctx">   return payload;</DiffLine>
              <DiffLine type="ctx"> {'}'}</DiffLine>
            </div>
          </div>
        )}
        <div className="row gap-1" style={{ marginTop: 2 }}>
          <button className="btn btn-ghost btn-icon btn-sm has-tip"><Icon name="copy" size={12} /><span className="tip">copy</span></button>
          <button className="btn btn-ghost btn-icon btn-sm has-tip"><Icon name="refresh" size={12} /><span className="tip">regenerate</span></button>
          <button className="btn btn-ghost btn-icon btn-sm has-tip"><Icon name="more" size={12} /><span className="tip">more</span></button>
        </div>
      </div>
    </div>
  );
}

const ICON_FOR_TOOL = { terminal: 'terminal', web: 'globe', file: 'file', github: 'github', search: 'search' };

function DiffLine({ type, children }) {
  const colors = {
    add: { bg: 'color-mix(in oklab, var(--green) 12%, transparent)', c: 'var(--green)' },
    del: { bg: 'color-mix(in oklab, var(--red) 10%, transparent)', c: 'var(--red)' },
    ctx: { bg: 'transparent', c: 'var(--ink-3)' },
  };
  const k = colors[type];
  return <div style={{ padding: '1px 6px', background: k.bg, color: k.c, whiteSpace: 'pre' }}>{children}</div>;
}

function ThinkingBubble() {
  return (
    <div className="row gap-3" style={{ alignItems: 'center' }}>
      <Avatar letter="H" size={28} tone="accent" />
      <div className="row gap-2 t-sm c-3" style={{ fontStyle: 'italic' }}>
        <span>thinking</span>
        <span className="row gap-1">
          <span className="dot live" style={{ animationDelay: '0s' }} />
          <span className="dot live" style={{ animationDelay: '.2s' }} />
          <span className="dot live" style={{ animationDelay: '.4s' }} />
        </span>
      </div>
    </div>
  );
}

// ─── Composer ────────────────────────────────────────────────────────
function ChatComposer({ sess }) {
  const s = useStore();
  const [text, setText] = React.useState('');
  const [slashOpen, setSlashOpen] = React.useState(false);
  const [slashSel, setSlashSel] = React.useState(0);
  const textareaRef = React.useRef(null);

  const slashMatches = React.useMemo(() => {
    if (!text.startsWith('/')) return [];
    const q = text.slice(1).toLowerCase();
    return SEED_SLASH.filter(c => c.cmd.slice(1).startsWith(q)).slice(0, 6);
  }, [text]);
  React.useEffect(() => { setSlashOpen(slashMatches.length > 0); setSlashSel(0); }, [slashMatches.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    s.appendMessage(sess.id, { role: 'user', text: t });
    s.updateSession(sess.id, { live: true });
    setText('');
    // simulate agent
    setTimeout(() => {
      s.appendMessage(sess.id, {
        role: 'assistant',
        text: 'Got it — here\'s what I found. I\'ll break it into steps and start the first one now.',
        tools: [
          { tool: 'file',     call: 'src/auth/session.ts', dur: 0.1 },
          { tool: 'terminal', call: 'npm test -- --grep auth', dur: 1.4 },
        ],
      });
      s.updateSession(sess.id, { live: false });
    }, 1000);
  };

  const onKey = (e) => {
    if (slashOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashSel(x => Math.min(slashMatches.length - 1, x + 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSlashSel(x => Math.max(0, x - 1)); return; }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (slashMatches[slashSel]) {
          e.preventDefault();
          setText(slashMatches[slashSel].cmd + ' ');
          setSlashOpen(false);
          return;
        }
      }
      if (e.key === 'Escape') { setSlashOpen(false); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--line-soft)', flexShrink: 0, background: 'var(--paper)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
        {/* slash autocomplete */}
        {slashOpen && (
          <div className="slide-up" style={{
            position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--paper)', border: '1px solid var(--line)',
            borderRadius: 8, boxShadow: 'var(--shadow-md)', overflow: 'hidden', zIndex: 10,
          }}>
            <div className="uppercase t-xs c-4 fw-600" style={{ padding: '8px 12px 4px' }}>Slash commands</div>
            {slashMatches.map((c, i) => (
              <div key={c.cmd} onClick={() => { setText(c.cmd + ' '); setSlashOpen(false); textareaRef.current?.focus(); }}
                onMouseEnter={() => setSlashSel(i)}
                style={{
                  display: 'flex', gap: 10, padding: '8px 12px', cursor: 'pointer',
                  background: i === slashSel ? 'var(--paper-2)' : 'transparent',
                }}>
                <Icon name="slash" size={12} className="c-3" />
                <span className="mono fw-600 t-sm">{c.cmd}</span>
                <span className="c-3 t-sm truncate flex-1">{c.desc}</span>
                {i === slashSel && <span className="kbd">tab</span>}
              </div>
            ))}
          </div>
        )}

        <div className="input" style={{ padding: 12, alignItems: 'stretch', flexDirection: 'column' }}>
          <textarea ref={textareaRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={onKey}
            rows={text.includes('\n') ? 3 : 1}
            placeholder={`Message ${sess.title}…  (type / for commands, @ for files)`}
            style={{ resize: 'none', width: '100%', background: 'transparent', fontSize: 14, color: 'var(--ink)', minHeight: 24 }} />
          <div className="row gap-2" style={{ marginTop: 8 }}>
            <button className="btn btn-sm btn-ghost"><Icon name="upload" size={13} /> Attach</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setText(t => t + '@')}><Icon name="at" size={13} /> Mention</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setText('/')}><Icon name="slash" size={13} /> /</button>
            <div style={{ flex: 1 }} />
            <span className="t-xs c-4">{sess.model}</span>
            <button className={`btn btn-icon btn-sm ${s.state.voiceOn ? 'btn-accent' : 'btn-ghost'}`} onClick={s.toggleVoice}>
              <Icon name={s.state.voiceOn ? 'mic' : 'mic_off'} size={13} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={send} disabled={!text.trim()} style={{ opacity: text.trim() ? 1 : 0.5 }}>
              <Icon name="send" size={12} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Right panel: tool stream or inspector ──────────────────────────
function ChatRightPanel({ sess }) {
  const s = useStore();
  if (s.state.rightPanel === 'tools') return <ToolStreamPanel sess={sess} />;
  return <InspectorPanel sess={sess} />;
}

function ToolStreamPanel({ sess }) {
  const all = sess.messages.flatMap(m => m.tools || []);
  return (
    <aside style={{ borderLeft: '1px solid var(--line-soft)', background: 'var(--paper-1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="row gap-2" style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-soft)' }}>
        <Icon name="tool" size={14} />
        <div className="fw-600" style={{ fontSize: 13 }}>Tool stream</div>
        <div style={{ flex: 1 }} />
        <span className="pill pill-ghost" style={{ fontSize: 10 }}>{all.length} calls</span>
      </div>
      <div className="scroll" style={{ padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
        {all.length === 0 && <div className="c-3 t-sm" style={{ fontFamily: 'var(--font-sans)' }}>No tool calls yet.</div>}
        {all.map((t, i) => (
          <div key={i} className="card" style={{ padding: 10, marginBottom: 8, background: 'var(--paper)' }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name={ICON_FOR_TOOL[t.tool] || 'tool'} size={11} className="c-3" />
              <span className="c-2 fw-600">{t.tool}</span>
              <div style={{ flex: 1 }} />
              <span className="c-4">{t.dur}s</span>
            </div>
            <div className="c-3" style={{ lineHeight: 1.5, wordBreak: 'break-word' }}>$ {t.call}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function InspectorPanel({ sess }) {
  const s = useStore();
  return (
    <aside style={{ borderLeft: '1px solid var(--line-soft)', background: 'var(--paper-1)', overflow: 'auto', padding: 16 }}>
      <div className="fw-600" style={{ fontSize: 13, marginBottom: 10 }}>Session info</div>
      <div className="col gap-3" style={{ fontSize: 12 }}>
        <InfoRow label="Model" value={sess.model} mono />
        <InfoRow label="Personality" value={sess.personality} />
        <InfoRow label="Tokens" value={fmtTokens(sess.tokens) + ' / 200K'} />
        <InfoRow label="Cost" value={fmtCost(sess.cost)} />
        <InfoRow label="Messages" value={String(sess.msgCount)} />
        <InfoRow label="Updated" value={relTime(sess.updated)} />
      </div>
      <div className="hr" style={{ margin: '16px 0' }} />
      <div className="fw-600" style={{ fontSize: 13, marginBottom: 8 }}>Context</div>
      <div className="progress"><span style={{ width: sess.contextPct + '%' }} /></div>
      <div className="t-xs c-3" style={{ marginTop: 4 }}>{sess.contextPct}% used · auto-compress at {s.state.settings.compressionThreshold}%</div>
      <div className="hr" style={{ margin: '16px 0' }} />
      <div className="fw-600" style={{ fontSize: 13, marginBottom: 8 }}>Skills active</div>
      <div className="col gap-1">
        {sess.skills.map(sk => (
          <div key={sk} className="row gap-2"><Icon name="puzzle" size={11} className="c-3" /><span className="mono t-sm">{sk}</span></div>
        ))}
        {!sess.skills.length && <span className="t-sm c-3">None</span>}
      </div>
    </aside>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="row gap-2" style={{ justifyContent: 'space-between' }}>
      <span className="c-3">{label}</span>
      <span className={mono ? 'mono' : ''}>{value}</span>
    </div>
  );
}

Object.assign(window, { ChatPage });
