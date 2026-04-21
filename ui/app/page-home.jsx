// Hermes App — Home / Dashboard.
// Hero composer + recent sessions + pinned skills + background tasks at a glance.

function HomePage() {
  const s = useStore();
  const [prompt, setPrompt] = React.useState('');
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const recentSessions = [...s.state.sessions].sort((a,b) => b.updated - a.updated).slice(0, 6);
  const pinnedSkills = s.state.skills.filter(sk => sk.pinned);
  const runningTasks = s.state.bgTasks.filter(t => t.status === 'running');
  const totalTokens = s.state.sessions.reduce((a,c) => a + c.tokens, 0);
  const totalCost   = s.state.sessions.reduce((a,c) => a + c.cost, 0);

  const submit = () => {
    if (!prompt.trim()) return;
    s.newSession();
    // send after state flush
    setTimeout(() => {
      const latest = useStore(); // stale capture ok
      // we stored newest at head; grab its id
      latest.set((st) => {
        const id = st.sessions[0].id;
        return {
          ...st,
          sessions: st.sessions.map(se => se.id === id ? { ...se, title: prompt.slice(0, 48), messages: [{ role: 'user', text: prompt }], msgCount: 1 } : se),
        };
      });
      // simulate agent reply
      setTimeout(() => {
        const cur = useStore();
        cur.set((st) => {
          const id = st.sessions[0].id;
          return {
            ...st,
            sessions: st.sessions.map(se => se.id === id ? { ...se, messages: [...se.messages, { role: 'assistant', text: "On it. I'll dig in and stream updates as I go." }], msgCount: se.msgCount + 1 } : se),
          };
        });
      }, 700);
    }, 30);
    setPrompt('');
  };

  return (
    <div className="scroll full" style={{ padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Greeting + hero composer */}
        <div style={{ marginBottom: 28 }}>
          <div className="row gap-2" style={{ alignItems: 'baseline' }}>
            <h1 className="display" style={{ fontSize: 44, margin: 0, lineHeight: 1.05, letterSpacing: '-0.025em' }}>
              {greeting}, <span className="c-acc">Ariadne</span>.
            </h1>
          </div>
          <div className="t-md c-3" style={{ marginTop: 6 }}>
            You have <b className="c-1">{runningTasks.length} task{runningTasks.length === 1 ? '' : 's'} running</b> in the background,
            and {s.state.sessions.filter(se => se.live).length ? <b className="c-1">an active chat</b> : 'no live chats'}.
          </div>

          <div style={{
            marginTop: 22,
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--paper)',
            boxShadow: 'var(--shadow-sm)',
            padding: 14,
          }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); } }}
              rows={2}
              placeholder="What are we working on? Start a new session, or type / for commands."
              style={{
                width: '100%', resize: 'none', background: 'transparent',
                fontSize: 16, fontFamily: 'var(--font-sans)', color: 'var(--ink)',
                lineHeight: 1.5, letterSpacing: '-0.005em',
                border: 'none', padding: 4,
              }}
            />
            <div className="row gap-2" style={{ marginTop: 6 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => s.toast('attach files')}><Icon name="upload" size={13} /> Attach</button>
              <button className="btn btn-sm btn-ghost" onClick={() => s.openCmd()}><Icon name="slash" size={13} /> Commands</button>
              <button className="btn btn-sm btn-ghost" onClick={() => s.navigate('settings')}><Icon name="brain" size={13} /> {s.state.settings.model}</button>
              <button className="btn btn-sm btn-ghost" onClick={() => s.navigate('skills')}><Icon name="puzzle" size={13} /> {s.state.skills.filter(x=>x.pinned).length} skills pinned</button>
              <div style={{ flex: 1 }} />
              <span className="t-xs c-4"><span className="kbd">⌘</span><span className="kbd">↵</span> send · <span className="kbd">⇧</span><span className="kbd">↵</span> new line</span>
              <button className={`btn btn-icon btn-sm ${s.state.voiceOn ? 'btn-accent' : 'btn-ghost'}`} onClick={s.toggleVoice}>
                <Icon name={s.state.voiceOn ? 'mic' : 'mic_off'} size={14} />
              </button>
              <button className="btn btn-primary btn-sm" onClick={submit} disabled={!prompt.trim()}
                style={{ opacity: prompt.trim() ? 1 : 0.5 }}>
                <Icon name="send" size={13} /> Send
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          <StatTile label="Sessions today"   value={s.state.sessions.length} sub="+2 vs yesterday" icon="chat" />
          <StatTile label="Total tokens"     value={fmtTokens(totalTokens)}  sub="ctx avg 29%"    icon="chart" spark />
          <StatTile label="Spend (today)"    value={fmtCost(totalCost)}      sub={`budget ${fmtCost(s.state.settings.dailyBudget)}/day`} icon="dollar" />
          <StatTile label="Skills pinned"    value={pinnedSkills.length}     sub={`${s.state.skills.filter(x=>x.installed).length} installed`} icon="puzzle" />
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'flex-start' }}>

          {/* Sessions */}
          <div>
            <SectionHeader
              title="Recent sessions"
              subtitle="Pick up where you left off."
              right={
                <div className="row gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => s.navigate('sessions')}>View all <Icon name="arrow_right" size={12} /></button>
                  <button className="btn btn-sm btn-primary" onClick={() => s.newSession()}><Icon name="plus" size={12} /> New</button>
                </div>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {recentSessions.map((se) => <SessionCard key={se.id} sess={se} />)}
            </div>
          </div>

          {/* Right rail */}
          <div className="col gap-5">
            <div>
              <SectionHeader size="sm" title="Background"
                right={<button className="btn btn-sm btn-ghost" onClick={() => s.navigate('background')}>All <Icon name="arrow_right" size={12} /></button>} />
              <div className="col gap-2">
                {s.state.bgTasks.slice(0, 3).map((t) => <BgTaskRow key={t.id} task={t} compact />)}
                {s.state.bgTasks.length === 0 && <div className="t-sm c-3">No background tasks.</div>}
              </div>
            </div>

            <div>
              <SectionHeader size="sm" title="Pinned skills"
                right={<button className="btn btn-sm btn-ghost" onClick={() => s.navigate('skills')}>Hub <Icon name="arrow_right" size={12} /></button>} />
              <div className="col gap-2">
                {pinnedSkills.map(sk => <PinnedSkillRow key={sk.id} skill={sk} />)}
                {pinnedSkills.length === 0 && <div className="t-sm c-3">No skills pinned.</div>}
              </div>
            </div>

            <div>
              <SectionHeader size="sm" title="Model" />
              <div className="card" style={{ padding: 12 }}>
                <div className="row gap-2" style={{ marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--ink)', color: 'var(--paper)', display: 'grid', placeItems: 'center' }}>
                    <Icon name="brain" size={14} />
                  </div>
                  <div className="col flex-1" style={{ minWidth: 0 }}>
                    <div className="mono t-sm fw-600 truncate">{s.state.settings.model}</div>
                    <div className="t-xs c-3">{s.state.settings.provider} · reasoning: {s.state.settings.reasoning}</div>
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => s.navigate('settings')}>
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatTile({ label, value, sub, icon, spark }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row gap-2" style={{ marginBottom: 10 }}>
        <Icon name={icon} size={13} className="c-3" />
        <span className="t-xs c-3 uppercase fw-600">{label}</span>
        {spark && <div className="spark" style={{ marginLeft: 'auto' }}>
          {[3,5,4,7,6,8,5,9,7,10,8,11].map((h,i) => <span key={i} style={{ height: h + 'px' }} />)}
        </div>}
      </div>
      <div className="display" style={{ fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
      <div className="t-xs c-3" style={{ marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function SessionCard({ sess }) {
  const s = useStore();
  return (
    <div className="card interactive" style={{ padding: 14 }} onClick={() => s.openSession(sess.id)}>
      <div className="row gap-2" style={{ marginBottom: 10 }}>
        {sess.live && <span className="dot live" />}
        <div className="fw-600 truncate" style={{ fontSize: 14, flex: 1 }}>{sess.title}</div>
        {sess.pinned && <Icon name="pin" size={12} className="c-acc" />}
        {sess.warn && <Icon name="warn" size={12} style={{ color: 'var(--yellow)' }} />}
      </div>
      <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="pill pill-ghost mono" style={{ fontSize: 10.5 }}>{sess.model}</span>
        {sess.skills.slice(0, 2).map(sk => <span key={sk} className="pill mono" style={{ fontSize: 10.5 }}><Icon name="puzzle" size={10} /> {sk}</span>)}
      </div>
      <div className="row gap-3 t-xs c-3">
        <span>{relTime(sess.updated)}</span>
        <span>·</span>
        <span>{sess.msgCount} msgs</span>
        <span>·</span>
        <span>{fmtTokens(sess.tokens)}</span>
        <div style={{ flex: 1 }} />
        <div className="progress" style={{ width: 40 }}><span style={{ width: sess.contextPct + '%' }} /></div>
        <span>{sess.contextPct}%</span>
      </div>
    </div>
  );
}

function BgTaskRow({ task, compact }) {
  const s = useStore();
  const done = task.status === 'done';
  const canc = task.status === 'cancelled';
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="row gap-2" style={{ marginBottom: 6 }}>
        {done ? <Icon name="check" size={12} style={{ color: 'var(--green)' }} /> : canc ? <Icon name="close" size={12} className="c-3" /> : <span className="dot live" />}
        <div className="t-sm fw-500 truncate flex-1">{task.title}</div>
        <span className="t-xs c-4 mono">{fmtSecs(task.elapsed)}</span>
      </div>
      {!done && !canc && <>
        <div className="progress"><span style={{ width: task.progress + '%' }} /></div>
        {!compact && <div className="row gap-2" style={{ marginTop: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => s.cancelBgTask(task.id)}><Icon name="close" size={11} /> Cancel</button>
        </div>}
      </>}
    </div>
  );
}

function PinnedSkillRow({ skill }) {
  const s = useStore();
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="row gap-2">
        <div style={{ width: 26, height: 26, borderRadius: 5, background: 'var(--paper-2)', display: 'grid', placeItems: 'center' }}>
          <Icon name="puzzle" size={13} />
        </div>
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="mono t-sm fw-600 truncate">{skill.name}</div>
          <div className="t-xs c-3 truncate">{skill.desc}</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm has-tip" onClick={() => s.toggleSkillPinned(skill.id)}>
          <Icon name="pin" size={12} className="c-acc" />
          <span className="tip">unpin</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, SessionCard, BgTaskRow, PinnedSkillRow, StatTile });
