// Hermes App — Sessions (history), Skills hub, Background tasks, Settings pages.

// ─── Sessions page ───────────────────────────────────────────────────
function SessionsPage() {
  const s = useStore();
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [sort, setSort] = React.useState('recent');

  const list = React.useMemo(() => {
    let l = [...s.state.sessions];
    if (filter === 'active')   l = l.filter(x => x.live);
    if (filter === 'pinned')   l = l.filter(x => x.pinned);
    if (filter === 'archived') l = l.filter(x => x.archived);
    if (q) l = l.filter(x => x.title.toLowerCase().includes(q.toLowerCase()));
    if (sort === 'recent')  l.sort((a,b) => b.updated - a.updated);
    if (sort === 'tokens')  l.sort((a,b) => b.tokens - a.tokens);
    if (sort === 'cost')    l.sort((a,b) => b.cost - a.cost);
    return l;
  }, [s.state.sessions, q, filter, sort]);

  return (
    <div className="scroll full" style={{ padding: '32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionHeader title="Sessions" subtitle={`${s.state.sessions.length} total · ${s.state.sessions.filter(x=>x.live).length} live · ${s.state.sessions.filter(x=>x.archived).length} archived`}
          right={<button className="btn btn-primary btn-sm" onClick={() => s.newSession()}><Icon name="plus" size={12} /> New session</button>} />
        <div className="row gap-2" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
          <div className="input" style={{ minWidth: 260, flex: 1 }}>
            <Icon name="search" size={13} className="c-3" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search sessions by title…" />
          </div>
          <div className="row gap-1">
            {['all','active','pinned','archived'].map(k => (
              <button key={k} className={`btn btn-sm ${filter===k?'active':'btn-ghost'}`} onClick={()=>setFilter(k)}>{k}</button>
            ))}
          </div>
          <div className="row gap-1">
            <span className="t-sm c-3">sort:</span>
            {['recent','tokens','cost'].map(k => (
              <button key={k} className={`btn btn-sm ${sort===k?'active':'btn-ghost'}`} onClick={()=>setSort(k)}>{k}</button>
            ))}
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 110px 90px 70px 120px 40px', padding: '10px 14px', borderBottom: '1px solid var(--line-soft)', fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            <span>Title</span><span>Model</span><span>Updated</span><span>Tokens</span><span>Cost</span><span>Context</span><span></span>
          </div>
          {list.map(se => (
            <div key={se.id} className="row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 140px 110px 90px 70px 120px 40px', padding: '10px 14px', borderBottom: '1px solid var(--line-soft)', alignItems: 'center', fontSize: 13, cursor: 'pointer' }}
              onClick={() => s.openSession(se.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--paper-1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="row gap-2" style={{ minWidth: 0 }}>
                {se.live ? <span className="dot live" /> : se.warn ? <Icon name="warn" size={12} style={{ color: 'var(--yellow)' }} /> : <Icon name="chat" size={12} className="c-3" />}
                <span className="truncate fw-500">{se.title}</span>
                {se.pinned && <Icon name="pin" size={11} className="c-acc" />}
                {se.archived && <span className="pill" style={{ fontSize: 10 }}>archived</span>}
              </div>
              <span className="mono t-sm c-2 truncate">{se.model}</span>
              <span className="t-sm c-3">{relTime(se.updated)}</span>
              <span className="t-sm mono">{fmtTokens(se.tokens)}</span>
              <span className="t-sm mono">{fmtCost(se.cost)}</span>
              <div className="row gap-2"><div className="progress" style={{ flex: 1 }}><span style={{ width: se.contextPct + '%' }} /></div><span className="t-xs c-3">{se.contextPct}%</span></div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); s.updateSession(se.id, { pinned: !se.pinned }); }}>
                <Icon name="more_v" size={13} />
              </button>
            </div>
          ))}
          {list.length === 0 && <div className="c-3" style={{ padding: 40, textAlign: 'center' }}>No sessions match.</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Skills hub ──────────────────────────────────────────────────────
function SkillsPage() {
  const s = useStore();
  const [q, setQ] = React.useState('');
  const [tab, setTab] = React.useState('installed');

  const filtered = s.state.skills.filter(sk => {
    if (tab === 'installed' && !sk.installed) return false;
    if (tab === 'browse' && sk.installed) return false;
    if (q && !(sk.name + ' ' + sk.desc).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const pinned = filtered.filter(sk => sk.pinned);
  const others = filtered.filter(sk => !sk.pinned);

  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionHeader title="Skills hub"
          subtitle={`${s.state.skills.filter(x=>x.installed).length} installed · ${s.state.skills.filter(x=>x.pinned).length} pinned · ${s.state.skills.filter(x=>!x.installed).length} available`}
          right={<button className="btn btn-primary btn-sm" onClick={() => s.toast('skill published')}><Icon name="upload" size={12} /> Publish</button>} />

        <div className="row gap-2" style={{ marginBottom: 18 }}>
          <div className="input" style={{ minWidth: 260, flex: 1 }}>
            <Icon name="search" size={13} className="c-3" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search skills…" />
          </div>
          <div className="row gap-1">
            {[['installed','Installed'],['browse','Browse hub']].map(([k,l]) => (
              <button key={k} className={`btn btn-sm ${tab===k?'active':'btn-ghost'}`} onClick={()=>setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        {tab === 'installed' && pinned.length > 0 && (
          <>
            <div className="uppercase t-xs c-3 fw-600" style={{ marginBottom: 10 }}>Pinned</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
              {pinned.map(sk => <SkillCard key={sk.id} skill={sk} />)}
            </div>
          </>
        )}
        <div className="uppercase t-xs c-3 fw-600" style={{ marginBottom: 10 }}>{tab === 'installed' ? 'All installed' : 'Available'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {others.map(sk => <SkillCard key={sk.id} skill={sk} />)}
        </div>
        {filtered.length === 0 && <div className="c-3" style={{ padding: 40, textAlign: 'center' }}>No skills match.</div>}
      </div>
    </div>
  );
}

function SkillCard({ skill }) {
  const s = useStore();
  return (
    <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row gap-2">
        <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--paper-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="puzzle" size={15} />
        </div>
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="mono fw-600 truncate" style={{ fontSize: 13 }}>{skill.name}</div>
          <div className="t-xs c-3 truncate">v{skill.version} · {skill.author}</div>
        </div>
        {skill.installed && (
          <button className="btn btn-ghost btn-icon btn-sm has-tip" onClick={() => s.toggleSkillPinned(skill.id)}>
            <Icon name="pin" size={12} className={skill.pinned ? 'c-acc' : 'c-3'} />
            <span className="tip">{skill.pinned ? 'unpin' : 'pin'}</span>
          </button>
        )}
      </div>
      <div className="t-sm c-2 clamp-2" style={{ minHeight: 36 }}>{skill.desc}</div>
      <div className="row gap-2">
        <span className="pill" style={{ fontSize: 10 }}>{skill.category}</span>
        <div style={{ flex: 1 }} />
        {skill.installed
          ? <button className="btn btn-outline btn-sm" onClick={() => { s.toggleSkillInstalled(skill.id); s.toast(`uninstalled ${skill.name}`); }}>Uninstall</button>
          : <button className="btn btn-primary btn-sm" onClick={() => { s.toggleSkillInstalled(skill.id); s.toast(`installed ${skill.name}`); }}><Icon name="download" size={11} /> Install</button>}
      </div>
    </div>
  );
}

// ─── Background tasks page ───────────────────────────────────────────
function BackgroundPage() {
  const s = useStore();
  const [prompt, setPrompt] = React.useState('');
  const run    = s.state.bgTasks.filter(t => t.status === 'running');
  const done   = s.state.bgTasks.filter(t => t.status === 'done');
  const other  = s.state.bgTasks.filter(t => t.status !== 'running' && t.status !== 'done');
  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <SectionHeader title="Background tasks" subtitle={`${run.length} running · ${done.length} done`} />

        <div className="card" style={{ padding: 12, marginBottom: 20 }}>
          <div className="row gap-2">
            <Icon name="zap" size={14} className="c-acc" />
            <input value={prompt} onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && prompt.trim()) { s.addBgTask(prompt.trim()); setPrompt(''); s.toast('queued'); } }}
              placeholder="Queue a new background task… (e.g. summarize my open PRs)"
              style={{ flex: 1, fontSize: 14 }} />
            <button className="btn btn-primary btn-sm" disabled={!prompt.trim()} onClick={() => { s.addBgTask(prompt.trim()); setPrompt(''); s.toast('queued'); }} style={{ opacity: prompt.trim() ? 1 : 0.5 }}>
              <Icon name="send" size={12} /> Queue
            </button>
          </div>
        </div>

        {run.length > 0 && <BgGroup label="Running" items={run} />}
        {done.length > 0 && <BgGroup label="Completed" items={done} />}
        {other.length > 0 && <BgGroup label="Cancelled" items={other} />}
        {s.state.bgTasks.length === 0 && <div className="c-3" style={{ padding: 40, textAlign: 'center' }}>No background tasks.</div>}
      </div>
    </div>
  );
}
function BgGroup({ label, items }) {
  const s = useStore();
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="uppercase t-xs c-3 fw-600" style={{ marginBottom: 10 }}>{label}</div>
      <div className="col gap-2">
        {items.map(t => (
          <div key={t.id} className="card" style={{ padding: 14 }}>
            <div className="row gap-2" style={{ marginBottom: 8 }}>
              {t.status === 'done' ? <Icon name="check" size={13} style={{ color: 'var(--green)' }} />
               : t.status === 'cancelled' ? <Icon name="close" size={13} className="c-3" />
               : <span className="dot live" />}
              <div className="fw-500 flex-1 truncate">{t.title}</div>
              <span className="pill mono" style={{ fontSize: 10 }}>{t.model}</span>
              <span className="t-xs c-4 mono">{fmtSecs(t.elapsed)}</span>
            </div>
            {t.status === 'running' && <>
              <div className="progress"><span style={{ width: t.progress + '%' }} /></div>
              <div className="row gap-2" style={{ marginTop: 10 }}>
                <span className="t-xs c-3 flex-1">{Math.round(t.progress)}% · ETA ~{Math.max(1, Math.round((100 - t.progress) / 10))}s</span>
                <button className="btn btn-ghost btn-sm" onClick={() => s.cancelBgTask(t.id)}><Icon name="close" size={11} /> Cancel</button>
                <button className="btn btn-outline btn-sm" onClick={() => s.toast('opened')}><Icon name="eye" size={11} /> Peek</button>
              </div>
            </>}
            {t.status === 'done' && (
              <div className="row gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => s.toast('opened results')}><Icon name="eye" size={11} /> View results</button>
                <button className="btn btn-ghost btn-sm" onClick={() => s.removeBgTask(t.id)}><Icon name="trash" size={11} /> Dismiss</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings page ───────────────────────────────────────────────────
function SettingsPage() {
  const s = useStore();
  const [tab, setTab] = React.useState('model');
  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 32 }}>
        <aside className="col gap-1">
          <SectionHeader title="Settings" size="sm" />
          {[
            ['model','Model & profile','brain'],
            ['voice','Voice & input','mic'],
            ['connectors','Connectors','plug'],
            ['personality','Personality','sparkle'],
            ['context','Context & compression','chart'],
            ['appearance','Appearance','sun'],
            ['account','Account','user'],
          ].map(([k,l,ic]) => (
            <button key={k} className={`btn btn-sm ${tab===k?'active':'btn-ghost'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setTab(k)}>
              <Icon name={ic} size={13} /> {l}
            </button>
          ))}
        </aside>
        <div>
          {tab === 'model'       && <SettingsModel />}
          {tab === 'voice'       && <SettingsVoice />}
          {tab === 'connectors'  && <SettingsConnectors />}
          {tab === 'personality' && <SettingsPersonality />}
          {tab === 'context'     && <SettingsContext />}
          {tab === 'appearance'  && <SettingsAppearance />}
          {tab === 'account'     && <SettingsAccount />}
        </div>
      </div>
    </div>
  );
}
function Field({ label, desc, children }) {
  return (
    <div className="row gap-4" style={{ padding: '16px 0', borderBottom: '1px solid var(--line-soft)', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div className="fw-600" style={{ fontSize: 13 }}>{label}</div>
        {desc && <div className="t-sm c-3" style={{ marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ minWidth: 240, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{children}</div>
    </div>
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="input" style={{ padding: '6px 8px', cursor: 'pointer', minWidth: 220 }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function SettingsModel() {
  const s = useStore();
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Model & profile</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>Default model used for new sessions. Change per-session from the chat header.</p>
      <Field label="Primary model" desc="Used for new chats.">
        <Select value={s.state.settings.model} onChange={v => s.setSetting('model', v)}
          options={SEED_MODELS.map(m => ({ value: m.id, label: `${m.label}  ·  ${m.ctx}  ·  ${m.cost}` }))} />
      </Field>
      <Field label="Fallback model" desc="Used when the primary is rate-limited or unavailable.">
        <Select value={s.state.settings.fallback} onChange={v => s.setSetting('fallback', v)}
          options={SEED_MODELS.map(m => ({ value: m.id, label: m.label }))} />
      </Field>
      <Field label="Reasoning effort" desc="Higher = more deliberate thinking; slower, more expensive.">
        <div className="row gap-1">
          {['low','medium','high'].map(k => <button key={k} className={`btn btn-sm ${s.state.settings.reasoning===k?'active':'btn-outline'}`} onClick={() => s.setSetting('reasoning', k)}>{k}</button>)}
        </div>
      </Field>
      <Field label="Temperature" desc={`Creativity. Current: ${s.state.settings.temperature}`}>
        <input type="range" min="0" max="1" step="0.1" value={s.state.settings.temperature} onChange={e => s.setSetting('temperature', +e.target.value)} style={{ width: 200 }} />
      </Field>
      <Field label="Provider">
        <Select value={s.state.settings.provider} onChange={v => s.setSetting('provider', v)} options={[{value:'nous portal',label:'nous portal'},{value:'self-hosted',label:'self-hosted'},{value:'anthropic direct',label:'anthropic direct'}]} />
      </Field>
    </div>
  );
}
function SettingsVoice() {
  const s = useStore();
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Voice & input</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>Push-to-talk or always-on. Hotkey is global while the app is focused.</p>
      <Field label="Voice mode" desc="Hold ⌃B to record, release to send.">
        <div className={`toggle ${s.state.voiceOn?'on':''}`} onClick={s.toggleVoice} />
      </Field>
      <Field label="TTS playback" desc="Read assistant replies aloud."><div className="toggle" onClick={(e) => e.currentTarget.classList.toggle('on')} /></Field>
      <Field label="Microphone"><Select value="default" onChange={()=>{}} options={[{value:'default',label:'System default'},{value:'usb',label:'Blue Yeti USB'}]} /></Field>
      <Field label="Voice"><Select value="sage" onChange={()=>{}} options={[{value:'sage',label:'Sage (warm, neutral)'},{value:'river',label:'River (bright)'},{value:'lark',label:'Lark (fast)'}]} /></Field>
    </div>
  );
}
function SettingsConnectors() {
  const s = useStore();
  const list = [
    ['terminal','Terminal','Run shell commands in a sandbox.','terminal'],
    ['web','Web search','Search the open web.','globe'],
    ['files','Files','Read & edit local project files.','folder'],
    ['github','GitHub','Issues, PRs, reviews.','github'],
    ['slack','Slack','Post & summarize.','chat'],
    ['gmail','Gmail','Triage & draft.','chat'],
  ];
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Connectors</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>What the agent is allowed to touch.</p>
      {list.map(([k,l,d,ic]) => (
        <Field key={k} label={<span className="row gap-2"><Icon name={ic} size={13} />{l}</span>} desc={d}>
          <div className={`toggle ${s.state.settings.connectors[k]?'on':''}`} onClick={() => s.setConnector(k, !s.state.settings.connectors[k])} />
        </Field>
      ))}
    </div>
  );
}
function SettingsPersonality() {
  const s = useStore();
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Personality</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 16px' }}>Conversational style. Takes effect on next reply.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {SEED_PERSONALITIES.map(p => (
          <div key={p.id} className="card interactive" style={{ padding: 12, borderColor: s.state.settings.personality === p.id ? 'var(--accent)' : undefined, background: s.state.settings.personality === p.id ? 'var(--accent-soft)' : undefined }}
            onClick={() => s.setSetting('personality', p.id)}>
            <div className="row gap-2" style={{ marginBottom: 4 }}>
              <span className="fw-600">{p.label}</span>
              {s.state.settings.personality === p.id && <Icon name="check" size={13} className="c-acc" style={{ marginLeft: 'auto' }} />}
            </div>
            <div className="t-sm c-3">{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function SettingsContext() {
  const s = useStore();
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Context & compression</h3>
      <p className="t-sm c-3" style={{ margin: '0 0 12px' }}>Automatic summarization to reclaim context.</p>
      <Field label="Auto-compress threshold" desc={`Summarize middle turns when context passes ${s.state.settings.compressionThreshold}%.`}>
        <input type="range" min="30" max="90" step="5" value={s.state.settings.compressionThreshold} onChange={e => s.setSetting('compressionThreshold', +e.target.value)} style={{ width: 200 }} />
      </Field>
      <Field label="Summary model" desc="Cheap & fast is usually right.">
        <Select value={s.state.settings.compressionModel} onChange={v => s.setSetting('compressionModel', v)} options={SEED_MODELS.map(m => ({ value: m.id, label: m.label }))} />
      </Field>
      <Field label="Daily budget" desc={`Soft cap: ${fmtCost(s.state.settings.dailyBudget)}/day.`}>
        <input type="range" min="1" max="50" step="1" value={s.state.settings.dailyBudget} onChange={e => s.setSetting('dailyBudget', +e.target.value)} style={{ width: 200 }} />
      </Field>
    </div>
  );
}
function SettingsAppearance() {
  const s = useStore();
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Appearance</h3>
      <Field label="Theme">
        <div className="row gap-1">
          <button className={`btn btn-sm ${!s.state.settings.dark?'active':'btn-outline'}`} onClick={()=>s.setSetting('dark', false)}><Icon name="sun" size={12} /> Light</button>
          <button className={`btn btn-sm ${s.state.settings.dark?'active':'btn-outline'}`} onClick={()=>s.setSetting('dark', true)}><Icon name="moon" size={12} /> Dark</button>
        </div>
      </Field>
      <Field label="Density">
        <div className="row gap-1">
          {['compact','cozy','comfortable'].map(k => <button key={k} className={`btn btn-sm ${s.state.settings.density===k?'active':'btn-outline'}`} onClick={()=>s.setSetting('density', k)}>{k}</button>)}
        </div>
      </Field>
    </div>
  );
}
function SettingsAccount() {
  return (
    <div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Account</h3>
      <Field label="Signed in as">
        <div className="row gap-2"><Avatar letter="a" size={24} tone="accent" /><span className="fw-500">ariadne@nous.io</span></div>
      </Field>
      <Field label="API key" desc="Used for self-hosted providers."><code className="mono t-sm c-3">sk-nous-••••••••••</code></Field>
      <Field label="Sign out"><button className="btn btn-outline btn-sm"><Icon name="logout" size={12} /> Sign out</button></Field>
    </div>
  );
}

Object.assign(window, { SessionsPage, SkillsPage, BackgroundPage, SettingsPage });
