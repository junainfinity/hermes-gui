// Approach A4 — Dashboard/hub home. Sessions arranged as a grid of cards,
// with a compact skills shelf, settings drawer, and a peek into background tasks.
// Clicking a card opens chat in a drawer. Good for long-running heavy users.

function ApproachA4() {
  return (
    <div className="wf artboard-root" style={{ background: 'var(--paper)', position: 'relative', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      {/* Header */}
      <header style={{ padding: '14px 24px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1.5px solid var(--line-soft)', flexWrap: 'nowrap' }}>
        <div className="box-fill" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>H</div>
        <div style={{ minWidth: 0, flexShrink: 0 }}>
          <div style={{ fontFamily: 'Caveat', fontSize: 24, fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap' }}>Hermes</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2, whiteSpace: 'nowrap' }}>nous · sonnet-4</div>
        </div>
        <div className="box-soft" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', flex: 1, minWidth: 0, marginLeft: 8 }}>
          <Ic k="search" size={13} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>Search sessions, skills, messages…</span>
          <span className="kbd" style={{ flexShrink: 0 }}>⌘K</span>
        </div>
        <button className="btn btn-accent" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><Ic k="plus" size={12} /> New</button>
        <button className="btn" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><Ic k="bolt" size={12} /> Bg</button>
        <Ic k="cog" style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
        <Avatar letter="a" />
      </header>

      {/* Body grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, overflow: 'hidden' }}>
        <main className="scroll" style={{ padding: '18px 28px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top usage stats strip */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <StatCard label="Sessions today" value="7" sub="+2 vs yest" />
            <StatCard label="Total tokens" value="142K" sub="ctx avg 34%" />
            <StatCard label="Spend (today)" value="$0.94" sub="budget $5/day" />
            <StatCard label="Active skills" value="8" sub="2 pinned" />
          </section>

          {/* Sessions grid */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <div className="hand" style={{ fontSize: 24, fontWeight: 700 }}>Sessions</div>
              <span className="pill pill-fill">all</span>
              <span className="pill">active</span>
              <span className="pill">pinned</span>
              <span className="pill">archived</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>sort: recent ▾</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <BigSessionCard title="refactoring auth" live pinned model="sonnet-4" last="just now" ctx={48} msgs={28} />
              <BigSessionCard title="log triage · nginx" model="sonnet-4" last="12m ago" ctx={18} msgs={14} />
              <BigSessionCard title="skills hub spike" model="haiku-4.5" last="1h ago" ctx={8} msgs={6} />
              <BigSessionCard title="fix issue #123" model="sonnet-4" last="yesterday" ctx={62} msgs={40} warn />
              <BigSessionCard title="llama fine-tune" model="sonnet-4" last="yesterday" ctx={71} msgs={56} warn />
              <BigSessionCard title="PR #412 review" model="haiku-4.5" last="2d ago" ctx={12} msgs={22} archived />
            </div>
          </section>

          {/* Skills shelf */}
          <section>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'nowrap' }}>
              <div className="hand" style={{ fontSize: 24, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Your skills</div>
              <span className="pill" style={{ flexShrink: 0 }}><Ic k="skill" size={11} /> 8 installed</span>
              <div style={{ flex: 1 }} />
              <button className="btn" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}><Ic k="search" size={11} /> Browse hub</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <SkillCard name="github-pr-workflow" desc="open, review, merge PRs end-to-end" pinned />
              <SkillCard name="github-auth" desc="token-scoped GH auth helper" pinned />
              <SkillCard name="axolotl" desc="fine-tune LLMs locally" />
              <SkillCard name="gif-search" desc="find & paste GIFs by vibe" />
              <SkillCard name="excalidraw" desc="sketch diagrams with prompts" />
              <SkillCard name="hermes-agent-dev" desc="self-host contributor kit" />
              <SkillCard name="gmail-triage" desc="inbox zero at your command" />
              <SkillCard addNew />
            </div>
          </section>
        </main>

        {/* Right column: background + settings peek */}
        <aside style={{ borderLeft: '1.5px solid var(--line-soft)', background: 'var(--paper-2)', padding: 18, display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div className="hand" style={{ fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>Background tasks</div>
              <span className="pill pill-accent" style={{ fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>3 running</span>
              <div style={{ flex: 1 }} />
              <Ic k="plus" style={{ color: 'var(--ink-3)' }} />
            </div>
            <BgTaskCard id="#1" title="analyze /var/log errors from today" progress={72} elapsed="2m 14s" />
            <BgTaskCard id="#2" title="summarize PR diffs in ~/proj" progress={35} elapsed="48s" />
            <BgTaskCard id="#3" title="security scan *.py" progress={100} elapsed="1m 10s" done />
          </section>

          <section>
            <div className="hand" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Model & profile</div>
            <div className="box-soft" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SettingRow label="Model" value="anthropic/claude-sonnet-4" />
              <SettingRow label="Provider" value="nous portal" />
              <SettingRow label="Reasoning" value="high" />
              <SettingRow label="Personality" value="concise" />
              <SettingRow label="Fallback" value="haiku-4.5" />
            </div>
          </section>

          <section>
            <div className="hand" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Compression</div>
            <div className="box-soft" style={{ padding: 10 }}>
              <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span>threshold</span><span className="mono">50%</span>
              </div>
              <div className="ctxbar" style={{ marginTop: 6 }}><span style={{ width: '50%' }} /></div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>summary model · gemini-3-flash</div>
            </div>
          </section>

          <section style={{ marginTop: 'auto' }}>
            <div className="hand" style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Voice</div>
            <div className="box-soft" style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ic k="voice" size={14} />
              <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Voice mode</span>
              <div style={{ flex: 1 }} />
              <Toggle on={false} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6 }}>
              hold <span className="kbd">⌃B</span> to record · TTS off
            </div>
          </section>
        </aside>
      </div>

      {/* Annotations removed */}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="box-soft" style={{ padding: 12 }}>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ fontFamily: 'Caveat', fontSize: 32, fontWeight: 700, lineHeight: 1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function BigSessionCard({ title, live, pinned, archived, model, last, ctx, msgs, warn }) {
  return (
    <div className="box" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: archived ? 'var(--paper-2)' : 'var(--paper)', opacity: archived ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'Caveat', fontSize: 20, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        {pinned && <Ic k="pin" size={12} style={{ color: 'var(--accent)' }} />}
        {live && <span className="pill pill-accent" style={{ fontSize: 10 }}>● live</span>}
      </div>
      <div className="hatch-soft" style={{ height: 40, borderRadius: 2 }} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="pill" style={{ fontSize: 10 }}>{model}</span>
        <span className="pill" style={{ fontSize: 10 }}>{msgs} msgs</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="ctxbar" style={{ flex: 1 }}><span style={{ width: `${ctx}%`, background: warn ? 'var(--accent)' : 'var(--ink)' }} /></div>
        <span className="mono" style={{ fontSize: 10 }}>{ctx}%</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{last}</div>
    </div>
  );
}

function SkillCard({ name, desc, pinned, addNew }) {
  if (addNew) return (
    <div className="box-dashed" style={{ padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ink-3)', minHeight: 78 }}>
      <Ic k="plus" size={13} /> install skill
    </div>
  );
  return (
    <div className="box-soft" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 78, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <Ic k="skill" size={12} style={{ flexShrink: 0 }} />
        <span className="mono" style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{name}</span>
        {pinned && <Ic k="pin" size={10} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{desc}</div>
    </div>
  );
}

function BgTaskCard({ id, title, progress, elapsed, done }) {
  return (
    <div className="box-soft" style={{ padding: 10, marginTop: 8, background: 'var(--paper)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span className="mono" style={{ color: 'var(--ink-3)' }}>{id}</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
        {done ? <Ic k="check" size={11} style={{ color: 'var(--accent)' }} /> : <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', animation: 'pulse 1.2s infinite' }} />}
      </div>
      <div className="ctxbar" style={{ marginTop: 6 }}><span style={{ width: `${progress}%`, background: done ? 'var(--accent)' : 'var(--ink)' }} /></div>
      <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span>elapsed {elapsed}</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}

function SettingRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ color: 'var(--ink-3)', width: 92 }}>{label}</span>
      <span className="mono" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
      <Ic k="chev" size={10} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{ width: 30, height: 16, borderRadius: 8, background: on ? 'var(--accent)' : 'var(--paper-3)', border: '1.5px solid var(--line)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 1, left: on ? 14 : 1, width: 11, height: 11, borderRadius: '50%', background: on ? '#fff' : 'var(--ink-2)' }} />
    </div>
  );
}

window.ApproachA4 = ApproachA4;
