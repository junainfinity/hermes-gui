// Approach A2 — Command-palette-first. Minimal chrome. A big spotlight search bar is the front door;
// recent sessions and skills float as cards beneath it. Emphasis on keyboard-first, "launcher" vibe.

function ApproachA2() {
  return (
    <div className="wf artboard-root" style={{ background: 'var(--paper)', position: 'relative', padding: '28px 36px', gap: 20, display: 'flex', flexDirection: 'column' }}>
      {/* Top row: brand + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="box-fill" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontWeight: 700, fontSize: 16 }}>H</div>
        <div style={{ fontFamily: 'Caveat', fontSize: 24, fontWeight: 700 }}>Hermes</div>
        <span className="pill"><Ic k="stack" size={11} /> 3 live sessions</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace' }}>
          <span>claude-sonnet-4</span>
          <span>·</span>
          <span>$0.06 today</span>
          <span>·</span>
          <Avatar letter="a" />
        </div>
      </div>

      {/* Spotlight command bar + inline dropdown (in normal flow, not absolute) */}
      <div>
        <div className="box" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow)', background: 'var(--paper)' }}>
          <Ic k="slash" size={22} style={{ color: 'var(--accent)' }} />
          <span className="hand" style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink-4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ask, run, /command, or resume…
          </span>
          <span className="pill"><Ic k="mic" size={11} /> voice</span>
          <span className="kbd">⌘K</span>
        </div>

        {/* dropdown results — inline, below bar */}
        <div className="box" style={{ marginTop: 8, marginLeft: 40, marginRight: 40, background: 'var(--paper)', boxShadow: 'var(--shadow)', padding: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 1, textTransform: 'uppercase', padding: '4px 6px' }}>Commands</div>
          <ResultRow icon="bolt" title="/background" desc="run a prompt in its own session" kbd="⏎" active />
          <ResultRow icon="skill" title="/skills browse" desc="open the skills hub" />
          <ResultRow icon="user" title="/personality pirate" desc="change agent tone" />
          <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: 1, textTransform: 'uppercase', padding: '8px 6px 4px' }}>Resume</div>
          <ResultRow icon="clock" title='refactoring auth' desc="resumed · 12m · 5 msgs" />
        </div>
      </div>

      {/* Two-column body: Recents grid + right rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="hand" style={{ fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>Pick up where you left off</div>
            <div style={{ flex: 1 }} />
            <span className="pill">all</span>
            <span className="pill pill-fill">today</span>
            <span className="pill">week</span>
          </div>

          <div className="scroll" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignContent: 'flex-start', paddingBottom: 8 }}>
            <SessionCard title="refactoring auth" model="sonnet-4" msgs={28} cost="$0.06" ctx={6} skills={['github-auth']} live />
            <SessionCard title="skills hub spike" model="sonnet-4" msgs={12} cost="$0.02" ctx={14} skills={[]} />
            <SessionCard title="fix issue #123" model="haiku-4.5" msgs={40} cost="$0.01" ctx={32} skills={['github-pr']} />
            <SessionCard title="log triage · nginx" model="sonnet-4" msgs={18} cost="$0.09" ctx={48} skills={[]} />
            <SessionCard title="llama fine-tune" model="sonnet-4" msgs={56} cost="$0.31" ctx={71} skills={['axolotl']} warn />
            <SessionCard title="PR #412 review" model="haiku-4.5" msgs={22} cost="$0.03" ctx={12} skills={['github-pr']} />
          </div>
        </div>

        {/* Right rail */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
          <div className="box-soft" style={{ padding: 12 }}>
            <div className="divlabel" style={{ marginBottom: 8 }}>Background queue</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <BgRow title="analyze /var/log errors" progress={72} />
              <BgRow title="summarize PR diffs" progress={35} />
              <BgRow title="security scan · *.py" progress={100} done />
            </div>
          </div>

          <div className="box-soft" style={{ padding: 12 }}>
            <div className="divlabel" style={{ marginBottom: 8 }}>Pinned skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span className="pill"><Ic k="skill" size={11} /> github-pr-workflow</span>
              <span className="pill"><Ic k="skill" size={11} /> github-auth</span>
              <span className="pill"><Ic k="skill" size={11} /> axolotl</span>
              <span className="pill box-dashed"><Ic k="plus" size={11} /> browse hub</span>
            </div>
          </div>

          <div className="box-soft" style={{ padding: 12 }}>
            <div className="divlabel" style={{ marginBottom: 8 }}>Quick commands</div>
            <QuickRow cmd="/status" desc="systemctl status hermes-agent" />
            <QuickRow cmd="/gpu"    desc="nvidia-smi utilization" />
            <QuickRow cmd="/deploy" desc="run deploy.sh on staging" />
          </div>
        </aside>
      </div>

      {/* Annotations removed */}
    </div>
  );
}

function ResultRow({ icon, title, desc, kbd, active }) {
  return (
    <div style={{ padding: '6px 8px', borderRadius: 3, background: active ? 'var(--accent-soft)' : 'transparent', display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
      <Ic k={icon} size={13} style={{ color: active ? 'var(--accent-ink)' : 'var(--ink-3)', flexShrink: 0 }} />
      <span className="mono" style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>{title}</span>
      <span style={{ color: 'var(--ink-3)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{desc}</span>
      {kbd && <span className="kbd" style={{ flexShrink: 0 }}>{kbd}</span>}
    </div>
  );
}

function SessionCard({ title, model, msgs, cost, ctx, skills, live, warn }) {
  return (
    <div className="box" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--paper)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: 'Caveat', fontSize: 20, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title}</span>
        {live && <span className="pill pill-accent" style={{ fontSize: 10 }}>● live</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="pill" style={{ fontSize: 10 }}>{model}</span>
        <span className="pill" style={{ fontSize: 10 }}>{msgs} msgs</span>
        <span className="pill" style={{ fontSize: 10 }}>{cost}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="ctxbar" style={{ flex: 1 }}><span style={{ width: `${ctx}%`, background: warn ? 'var(--accent)' : 'var(--ink)' }} /></div>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{ctx}%</span>
      </div>
      {skills.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {skills.map((s) => <span key={s} className="pill" style={{ fontSize: 10 }}><Ic k="skill" size={9} /> {s}</span>)}
        </div>
      )}
    </div>
  );
}

function BgRow({ title, progress, done }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        {done
          ? <Ic k="check" size={11} style={{ color: 'var(--accent)' }} />
          : <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)' }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title}</span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{progress}%</span>
      </div>
      <div className="ctxbar" style={{ marginTop: 4 }}><span style={{ width: `${progress}%`, background: done ? 'var(--accent)' : 'var(--ink)' }} /></div>
    </div>
  );
}

function QuickRow({ cmd, desc }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0', fontSize: 12 }}>
      <span className="mono" style={{ fontWeight: 600 }}>{cmd}</span>
      <span style={{ color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{desc}</span>
      <Ic k="play" size={11} style={{ color: 'var(--ink-3)' }} />
    </div>
  );
}

window.ApproachA2 = ApproachA2;
