// Approach A1 — Classic chat: left sidebar (sessions + skills), center chat, right context panel.
// Familiar baseline, like ChatGPT / Claude.ai but adapted for Hermes concepts.

function ApproachA1() {
  return (
    <div className="wf artboard-root" style={{ display: 'grid', gridTemplateColumns: '220px 1fr 260px', position: 'relative' }}>
      {/* LEFT SIDEBAR */}
      <aside style={{ borderRight: '1.5px solid var(--line-soft)', padding: 14, display: 'flex', flexDirection: 'column', gap: 14, background: 'var(--paper-2)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="box-fill" style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontWeight: 700 }}>H</div>
          <div style={{ fontFamily: 'Caveat', fontSize: 22, fontWeight: 700, letterSpacing: .5 }}>Hermes</div>
        </div>

        <button className="btn btn-primary" style={{ justifyContent: 'flex-start', width: '100%' }}>
          <Ic k="plus" /> New session
        </button>

        <div className="box-soft" style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Ic k="search" style={{ color: 'var(--ink-3)' }} />
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Search sessions…</span>
          <span className="kbd" style={{ marginLeft: 'auto' }}>⌘K</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
          <div className="divlabel">Today</div>
          <SessionItem active title="refactoring auth" dur="12m" />
          <SessionItem title="skills hub spike" dur="4m" />
          <div className="divlabel" style={{ marginTop: 6 }}>Yesterday</div>
          <SessionItem title="fix issue #123" dur="28m" />
          <SessionItem title="log triage · nginx" dur="1h 04m" />
          <SessionItem title="resume demo" dur="8m" />
          <div className="divlabel" style={{ marginTop: 6 }}>Earlier</div>
          <SessionItem title="llama fine-tune" dur="2h" />
          <SessionItem title="PR #412 review" dur="35m" />
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1.5px dashed var(--line-soft)', paddingTop: 10 }}>
          <Avatar letter="a" />
          <div style={{ fontSize: 12, lineHeight: 1.2 }}>
            <div style={{ fontWeight: 600 }}>alex</div>
            <div style={{ color: 'var(--ink-3)' }}>Nous Portal</div>
          </div>
          <Ic k="cog" style={{ marginLeft: 'auto', color: 'var(--ink-3)' }} />
        </div>
      </aside>

      {/* CENTER — CHAT */}
      <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Topbar: session title + tabs + status */}
        <div style={{ padding: '10px 16px', borderBottom: '1.5px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap', minWidth: 0 }}>
          <div style={{ fontFamily: 'Caveat', fontSize: 22, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>refactoring auth</div>
          <span className="pill" style={{ flexShrink: 0 }}>sonnet-4</span>
          <span className="pill" style={{ flexShrink: 0 }}><Ic k="skill" size={11} /> github-pr</span>
          <span className="pill" style={{ flexShrink: 0 }}><Ic k="user" size={11} /> concise</span>
          <div style={{ flex: 1 }} />
          <Ic k="dots" style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
        </div>

        {/* Status bar */}
        <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-3)', borderBottom: '1.5px dashed var(--line-soft)' }}>
          <span>12.4K / 200K tokens</span>
          <div className="ctxbar" style={{ width: 120 }}><span style={{ width: '6%' }} /></div>
          <span>6%</span>
          <span>·</span>
          <span><Ic k="dollar" size={11} /> $0.06</span>
          <span>·</span>
          <span><Ic k="clock" size={11} /> 15m</span>
          <div style={{ flex: 1 }} />
          <span>resumed · 20260420_143052</span>
        </div>

        {/* Messages */}
        <div className="scroll" style={{ flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="msg-user">
            <div className="bar bar-long" style={{ marginBottom: 6 }} />
            <div className="bar bar-med" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar letter="H" />
            <div className="msg-agent" style={{ flex: 1 }}>
              <Bars lines={3} widths={['90%', '80%', '55%']} />
              <div style={{ marginTop: 10, borderTop: '1.5px dashed var(--line-soft)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="tool-row"><span className="dot" /> terminal · `git status` <span style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}>0.3s</span></div>
                <div className="tool-row"><span className="dot" /> web_search · "oauth 2.1 pkce" <span style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}>1.2s</span></div>
                <div className="tool-row"><span className="dot" /> edit_file · auth/session.ts <span style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}>0.1s</span></div>
              </div>
            </div>
          </div>

          <div className="msg-user">
            <div className="bar bar-med" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Avatar letter="H" />
            <div className="msg-agent" style={{ flex: 1 }}>
              <Bars lines={2} widths={['85%', '60%']} />
              <div className="box-soft" style={{ marginTop: 10, padding: 10, background: 'var(--paper)' }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>auth/session.ts · diff</div>
                <div className="hatch-soft" style={{ height: 60 }} />
              </div>
            </div>
          </div>

          {/* Thinking indicator */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--ink-3)', fontStyle: 'italic', fontSize: 13 }}>
            <Avatar letter="H" />
            <span className="hand" style={{ fontSize: 18 }}>◜ pondering… (1.2s)</span>
          </div>
        </div>

        {/* Composer */}
        <div style={{ padding: '10px 16px 14px', borderTop: '1.5px solid var(--line-soft)' }}>
          <div className="box" style={{ padding: 10, background: 'var(--paper)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="pill pill-accent"><Ic k="slash" size={11} /> /</span>
              <span className="bar bar-long" />
            </div>
            {/* slash autocomplete dropdown — anchored just above composer */}
            <div className="box" style={{ position: 'absolute', bottom: 72, left: 32, right: 32, background: 'var(--paper)', boxShadow: 'var(--shadow)', padding: 4, zIndex: 4, maxHeight: 140, overflow: 'hidden' }}>
              <SlashRow cmd="/background" desc="Run in separate session" active />
              <SlashRow cmd="/compress" desc="Summarize to reclaim context" />
              <SlashRow cmd="/model" desc="Switch model" />
              <SlashRow cmd="/skills" desc="Browse skills hub" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 6, borderTop: '1.5px dashed var(--line-soft)' }}>
              <span className="pill"><Ic k="plug" size={11} /> terminal, web, skills</span>
              <span className="pill"><Ic k="mic" size={11} /> voice: off</span>
              <div style={{ flex: 1 }} />
              <button className="btn"><Ic k="mic" size={12} /></button>
              <button className="btn btn-accent"><Ic k="send" size={12} /> Send</button>
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4, display: 'flex', gap: 10 }}>
            <span><span className="kbd">⏎</span> send</span>
            <span><span className="kbd">⌥⏎</span> newline</span>
            <span><span className="kbd">⌃C</span> interrupt</span>
            <span><span className="kbd">Tab</span> autocomplete</span>
          </div>
        </div>
      </main>

      {/* RIGHT — CONTEXT / BACKGROUND TASKS */}
      <aside style={{ borderLeft: '1.5px solid var(--line-soft)', background: 'var(--paper-2)', padding: 14, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <div>
          <div className="divlabel">Active skills</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            <SkillChip name="github-pr-workflow" />
            <SkillChip name="github-auth" />
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}><Ic k="plus" size={11} /> add skill</button>
          </div>
        </div>

        <div>
          <div className="divlabel">Background tasks</div>
          <BgTask id="#1" title="analyze /var/log errors" progress={70} />
          <BgTask id="#2" title="list Py security issues" progress={100} done />
        </div>

        <div>
          <div className="divlabel">Connected tools</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8, fontSize: 12 }}>
            <div className="pill"><Ic k="terminal" size={11}/> terminal</div>
            <div className="pill"><Ic k="globe" size={11}/> web</div>
            <div className="pill"><Ic k="folder" size={11}/> files</div>
            <div className="pill"><Ic k="skill" size={11}/> skills</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="divlabel">Checkpoints</div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--ink-3)' }}>
            <div>● 14:38 before edit</div>
            <div>● 14:31 fresh start</div>
            <button className="btn" style={{ marginTop: 4, justifyContent: 'center' }}><Ic k="branch" size={11}/> rollback</button>
          </div>
        </div>
      </aside>

      {/* Annotations removed — artboard labels explain the approach */}
    </div>
  );
}

function SessionItem({ title, dur, active }) {
  return (
    <div style={{
      padding: '6px 8px', borderRadius: 3,
      background: active ? 'var(--accent-soft)' : 'transparent',
      border: active ? '1.5px solid var(--accent)' : '1.5px solid transparent',
      display: 'flex', justifyContent: 'space-between', gap: 6,
      fontSize: 13,
      color: active ? 'var(--accent-ink)' : 'var(--ink-2)',
    }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{title}</span>
      <span style={{ color: 'var(--ink-4)', fontSize: 11, flexShrink: 0 }}>{dur}</span>
    </div>
  );
}

function SlashRow({ cmd, desc, active }) {
  return (
    <div style={{ padding: '6px 8px', borderRadius: 3, background: active ? 'var(--paper-2)' : 'transparent', display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
      <span className="mono" style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>{cmd}</span>
      <span style={{ color: 'var(--ink-3)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{desc}</span>
      {active && <span className="kbd" style={{ marginLeft: 'auto' }}>Tab</span>}
    </div>
  );
}

function SkillChip({ name }) {
  return (
    <div className="box-soft" style={{ padding: '5px 8px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, minWidth: 0 }}>
      <Ic k="skill" size={12} style={{ flexShrink: 0 }} />
      <span className="mono" style={{ fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>{name}</span>
      <Ic k="close" size={10} style={{ color: 'var(--ink-4)', flexShrink: 0 }} />
    </div>
  );
}

function BgTask({ id, title, progress, done }) {
  return (
    <div className="box-soft" style={{ padding: 8, marginTop: 6, background: 'var(--paper)' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
        <span className="mono" style={{ color: 'var(--ink-3)' }}>{id}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{title}</span>
        {done && <Ic k="check" size={11} style={{ color: 'var(--accent)' }} />}
      </div>
      <div className="ctxbar" style={{ marginTop: 6 }}>
        <span style={{ width: `${progress}%`, background: done ? 'var(--accent)' : 'var(--ink)' }} />
      </div>
    </div>
  );
}

window.ApproachA1 = ApproachA1;
