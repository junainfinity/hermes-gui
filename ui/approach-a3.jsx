// Approach A3 — Multi-pane workspace with session tabs along top, split chat/tool-stream,
// plus a right-side "inspector". IDE-style. Power-user feel.

function ApproachA3() {
  return (
    <div className="wf artboard-root" style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr auto', position: 'relative', background: 'var(--paper)' }}>
      {/* Tab bar — multi-session */}
      <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1.5px solid var(--line-soft)', background: 'var(--paper-2)', paddingLeft: 8, height: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px' }}>
          <div className="box-fill" style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Caveat', fontWeight: 700 }}>H</div>
        </div>
        <Tab title="refactoring auth" active />
        <Tab title="log triage" working />
        <Tab title="bg #1 errors" bg />
        <button style={{ background: 'transparent', border: 'none', padding: '0 10px', color: 'var(--ink-3)' }}><Ic k="plus" /></button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', fontSize: 12, color: 'var(--ink-3)' }}>
          <span className="pill" style={{ flexShrink: 0 }}><Ic k="voice" size={11} /> voice off</span>
          <Ic k="cog" />
          <Avatar letter="a" />
        </div>
      </div>

      {/* Breadcrumb / status strip */}
      <div style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ink-3)', borderBottom: '1.5px dashed var(--line-soft)', flexWrap: 'nowrap', whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>refactoring auth</span>
        <span>›</span>
        <span>sonnet-4</span>
        <span>›</span>
        <span>toolsets: terminal, web, skills</span>
        <div style={{ flex: 1 }} />
        <span>tokens</span>
        <div className="ctxbar" style={{ width: 80, flexShrink: 0 }}><span style={{ width: '48%' }} /></div>
        <span>48%</span>
        <span>·</span>
        <span>$0.18</span>
        <span>·</span>
        <span>42m</span>
        <button className="btn" style={{ padding: '2px 6px', fontSize: 11, flexShrink: 0 }}>/compress</button>
      </div>

      {/* Main split: Left rail · Chat · Tool stream · Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 300px 260px', overflow: 'hidden', minHeight: 0 }}>
        {/* Icon rail */}
        <div style={{ borderRight: '1.5px solid var(--line-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 14, background: 'var(--paper-2)' }}>
          <RailIcon k="chat" active />
          <RailIcon k="clock" />
          <RailIcon k="skill" />
          <RailIcon k="terminal" />
          <RailIcon k="branch" />
          <RailIcon k="cog" />
          <div style={{ flex: 1 }} />
          <RailIcon k="bolt" badge="2" />
        </div>

        {/* Chat */}
        <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1.5px solid var(--line-soft)', minHeight: 0 }}>
          <div className="scroll" style={{ flex: 1, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
            <div className="divlabel">Previous Conversation · recap</div>
            <div className="box-soft" style={{ padding: 10, fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic' }}>
              <Bars lines={2} widths={['88%', '55%']} />
            </div>
            <div className="msg-user"><Bars lines={1} widths={['70%']} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Avatar letter="H" />
              <div className="msg-agent" style={{ flex: 1 }}>
                <Bars lines={2} widths={['85%', '50%']} />
                <div className="box-soft" style={{ marginTop: 8, padding: 8 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>⚒ terminal</div>
                  <div className="mono" style={{ fontSize: 11, marginTop: 4 }}>$ git status</div>
                </div>
              </div>
            </div>
            <div className="msg-user"><Bars lines={1} widths={['40%']} /></div>
            <div style={{ color: 'var(--ink-3)', fontSize: 13, fontStyle: 'italic' }}>◠ contemplating… (2.4s)</div>
          </div>

          {/* Composer */}
          <div style={{ padding: 12, borderTop: '1.5px solid var(--line-soft)', flexShrink: 0 }}>
            <div className="box" style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ic k="slash" style={{ color: 'var(--accent)' }} />
              <span className="bar bar-long" />
              <Ic k="mic" style={{ color: 'var(--ink-3)' }} />
              <button className="btn btn-accent"><Ic k="send" size={11} /></button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4 }}>
              busy: <b>queue</b> · <span className="kbd">⏎</span> send · <span className="kbd">⌃C</span> interrupt
            </div>
          </div>
        </section>

        {/* Tool stream */}
        <section style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1.5px solid var(--line-soft)', background: 'var(--paper-2)', minHeight: 0 }}>
          <div style={{ padding: '10px 14px', borderBottom: '1.5px solid var(--line-soft)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div className="hand" style={{ fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>Tool stream</div>
            <div style={{ flex: 1 }} />
            <span className="pill" style={{ fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>verbose</span>
          </div>
          <div className="scroll" style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'JetBrains Mono, monospace', minHeight: 0 }}>
            <ToolCall icon="terminal" name="terminal" arg="git status" ms={300} />
            <ToolCall icon="globe"    name="web_search" arg="oauth 2.1 pkce" ms={1200} />
            <ToolCall icon="globe"    name="web_extract" arg="datatracker.ietf.org" ms={2100} />
            <ToolCall icon="folder"   name="read_file" arg="auth/session.ts" ms={60} />
            <ToolCall icon="tool"     name="edit_file" arg="auth/session.ts" ms={120} active />
            <ToolCall icon="terminal" name="terminal" arg="pnpm test auth" ms={4200} queued />
          </div>
        </section>

        {/* Inspector */}
        <aside style={{ display: 'flex', flexDirection: 'column', padding: 12, gap: 12, overflow: 'hidden', minHeight: 0 }}>
          <div className="divlabel">Inspector · edit_file</div>
          <div className="box-soft" style={{ padding: 10, flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>auth/session.ts</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span className="pill" style={{ fontSize: 10 }}>+12</span>
              <span className="pill" style={{ fontSize: 10 }}>−4</span>
            </div>
            <div className="hatch-soft" style={{ height: 54, marginTop: 8 }} />
          </div>

          <div style={{ flexShrink: 0 }}>
            <div className="divlabel">Checkpoints</div>
            <div style={{ marginTop: 8, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--accent)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>14:42 edit_file</span>
                <Ic k="branch" size={11} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--ink-4)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>14:38 pre-edit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--ink-4)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>14:31 fresh</span>
              </div>
            </div>
          </div>

          <div style={{ flexShrink: 0 }}>
            <div className="divlabel">Background #1</div>
            <div className="box-soft" style={{ padding: 8, marginTop: 6 }}>
              <div style={{ fontSize: 12 }}>analyze /var/log errors</div>
              <div className="ctxbar" style={{ marginTop: 4 }}><span style={{ width: '72%' }} /></div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4 }}>bg_143022_a1b2c3</div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', flexShrink: 0 }}>
            <div className="divlabel">Worktree</div>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-3)', marginTop: 4 }}>
              ~/repo/.worktrees/auth
            </div>
          </div>
        </aside>
      </div>

      {/* Status bar (foot) */}
      <div style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--ink-3)', borderTop: '1.5px solid var(--line-soft)', background: 'var(--paper-2)', whiteSpace: 'nowrap', overflow: 'hidden', flexShrink: 0 }}>
        <span>⚕ ready</span>
        <span>·</span>
        <span>queue: 1</span>
        <span>·</span>
        <span>bg: 2</span>
        <div style={{ flex: 1 }} />
        <span>skills: github-pr, github-auth</span>
        <span>·</span>
        <span>reasoning: high</span>
      </div>

      {/* Annotations removed */}
    </div>
  );
}

function Tab({ title, active, working, bg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px',
      borderRight: '1.5px solid var(--line-soft)',
      background: active ? 'var(--paper)' : 'transparent',
      borderTop: active ? '2.5px solid var(--accent)' : '2.5px solid transparent',
      fontSize: 12,
      color: active ? 'var(--ink)' : 'var(--ink-3)',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {bg ? <Ic k="bolt" size={11} style={{ color: 'var(--accent)' }} /> : <Ic k="chat" size={11} />}
      <span style={{ fontFamily: 'Caveat', fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>{title}</span>
      {working && <span className="mono" style={{ fontSize: 10, color: 'var(--accent)' }}>⟳</span>}
      <Ic k="close" size={10} style={{ color: 'var(--ink-4)' }} />
    </div>
  );
}

function RailIcon({ k, active, badge }) {
  return (
    <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: active ? 'var(--accent-soft)' : 'transparent', color: active ? 'var(--accent-ink)' : 'var(--ink-3)', border: active ? '1.5px solid var(--accent)' : '1.5px solid transparent' }}>
      <Ic k={k} size={16} />
      {badge && <span className="pill pill-accent" style={{ position: 'absolute', top: -4, right: -6, fontSize: 9, padding: '0 4px', minWidth: 14, justifyContent: 'center' }}>{badge}</span>}
    </div>
  );
}

function ToolCall({ icon, name, arg, ms, active, queued }) {
  return (
    <div className={queued ? 'box-dashed' : 'box-soft'} style={{
      padding: 8, background: active ? 'var(--accent-soft)' : (queued ? 'transparent' : 'var(--paper)'),
      borderColor: active ? 'var(--accent)' : undefined,
      opacity: queued ? 0.7 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
        <Ic k={icon} size={11} style={{ color: active ? 'var(--accent-ink)' : 'var(--ink-2)' }} />
        <span style={{ fontWeight: 600 }}>{name}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--ink-3)' }}>{queued ? 'queued' : `${ms}ms`}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>`{arg}`</div>
    </div>
  );
}

window.ApproachA3 = ApproachA3;
