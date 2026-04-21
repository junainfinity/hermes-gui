import { useMemo, useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { fmtCost, fmtTokens, relTime } from '@/lib/fmt'
import { SectionHeader } from '@/components/SectionHeader'
import type { BgTask, Session, Skill } from '@/types'

export function HomePage(): ReactNode {
  const s = useStore()
  const [prompt, setPrompt] = useState('')

  const hour = new Date().getHours()
  const greeting =
    hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const displayName = 'there'

  const recentSessions = useMemo(
    () => [...s.state.sessions].sort((a, b) => b.updated - a.updated).slice(0, 6),
    [s.state.sessions],
  )
  const pinnedSkills = useMemo(() => s.state.skills.filter((sk) => sk.pinned), [s.state.skills])
  const runningTasks = s.state.bgTasks.filter((t) => t.status === 'running')
  const totalTokens = s.state.sessions.reduce((a, c) => a + c.tokens, 0)
  const totalCost = s.state.sessions.reduce((a, c) => a + c.cost, 0)

  const submit = async (): Promise<void> => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    const id = s.newSession()
    setPrompt('')
    await s.sendMessage(id, trimmed)
  }

  return (
    <div className="scroll full" style={{ padding: '40px 32px 80px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1
            className="display"
            style={{ fontSize: 44, margin: 0, lineHeight: 1.05, letterSpacing: '-0.025em' }}
          >
            {greeting}, <span className="c-acc">{displayName}</span>.
          </h1>
          <div className="t-md c-3" style={{ marginTop: 6 }}>
            You have <b className="c-1">{runningTasks.length.toString()} task{runningTasks.length === 1 ? '' : 's'} running</b>{' '}
            in the background,{' '}
            {s.state.sessions.some((se) => se.live) ? (
              <b className="c-1">and an active chat.</b>
            ) : (
              'no live chats.'
            )}
          </div>

          <div
            style={{
              marginTop: 22,
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--paper)',
              boxShadow: 'var(--shadow-sm)',
              padding: 14,
            }}
          >
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  void submit()
                }
              }}
              rows={2}
              placeholder="What are we working on? Start a new session, or type / for commands."
              style={{
                width: '100%',
                resize: 'none',
                background: 'transparent',
                fontSize: 16,
                fontFamily: 'var(--font-sans)',
                color: 'var(--ink)',
                lineHeight: 1.5,
                border: 'none',
                padding: 4,
              }}
            />
            <div className="row gap-2" style={{ marginTop: 6 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => { s.toast('attach files coming soon') }}>
                <Icon name="upload" size={13} /> Attach
              </button>
              <button className="btn btn-sm btn-ghost" onClick={s.openCmd}>
                <Icon name="slash" size={13} /> Commands
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => { s.navigate('settings') }}>
                <Icon name="brain" size={13} /> {s.state.settings.model || 'no model'}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => { s.navigate('skills') }}>
                <Icon name="puzzle" size={13} /> {pinnedSkills.length.toString()} skills pinned
              </button>
              <div style={{ flex: 1 }} />
              <span className="t-xs c-4">
                <span className="kbd">⌘</span>
                <span className="kbd">↵</span> send
              </span>
              <button
                className={`btn btn-icon btn-sm ${s.state.voiceOn ? 'btn-accent' : 'btn-ghost'}`}
                onClick={s.toggleVoice}
                aria-label="toggle voice"
              >
                <Icon name={s.state.voiceOn ? 'mic' : 'mic_off'} size={14} />
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { void submit() }}
                disabled={!prompt.trim()}
                style={{ opacity: prompt.trim() ? 1 : 0.5 }}
              >
                <Icon name="send" size={13} /> Send
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          <StatTile label="Sessions" value={s.state.sessions.length} sub="all time" icon="chat" />
          <StatTile label="Total tokens" value={fmtTokens(totalTokens)} sub="across all sessions" icon="chart" />
          <StatTile label="Spend" value={fmtCost(totalCost)} sub={`budget ${fmtCost(s.state.settings.dailyBudget)}/day`} icon="dollar" />
          <StatTile label="Skills pinned" value={pinnedSkills.length} sub={`${s.state.skills.filter((x) => x.installed).length.toString()} installed`} icon="puzzle" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, alignItems: 'flex-start' }}>
          <div>
            <SectionHeader
              title="Recent sessions"
              subtitle="Pick up where you left off."
              right={
                <div className="row gap-2">
                  <button className="btn btn-sm btn-ghost" onClick={() => { s.navigate('sessions') }}>
                    View all <Icon name="arrow_right" size={12} />
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      s.newSession()
                    }}
                  >
                    <Icon name="plus" size={12} /> New
                  </button>
                </div>
              }
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {recentSessions.length === 0 ? (
                <div className="c-3 t-sm" style={{ padding: 20 }}>
                  No sessions yet. Start one above.
                </div>
              ) : (
                recentSessions.map((se) => <SessionCard key={se.id} sess={se} />)
              )}
            </div>
          </div>

          <div className="col gap-5">
            <div>
              <SectionHeader
                size="sm"
                title="Background"
                right={
                  <button className="btn btn-sm btn-ghost" onClick={() => { s.navigate('background') }}>
                    All <Icon name="arrow_right" size={12} />
                  </button>
                }
              />
              <div className="col gap-2">
                {s.state.bgTasks.slice(0, 3).map((t) => <BgTaskRow key={t.id} task={t} />)}
                {s.state.bgTasks.length === 0 && <div className="t-sm c-3">No background tasks.</div>}
              </div>
            </div>

            <div>
              <SectionHeader
                size="sm"
                title="Pinned skills"
                right={
                  <button className="btn btn-sm btn-ghost" onClick={() => { s.navigate('skills') }}>
                    Hub <Icon name="arrow_right" size={12} />
                  </button>
                }
              />
              <div className="col gap-2">
                {pinnedSkills.map((sk) => <PinnedSkillRow key={sk.id} skill={sk} />)}
                {pinnedSkills.length === 0 && <div className="t-sm c-3">No skills pinned.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatTileProps {
  label: string
  value: number | string
  sub: string
  icon: string
}

function StatTile({ label, value, sub, icon }: StatTileProps): ReactNode {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="row gap-2" style={{ marginBottom: 10 }}>
        <Icon name={icon} size={13} className="c-3" />
        <span className="t-xs c-3 uppercase fw-600">{label}</span>
      </div>
      <div className="display" style={{ fontSize: 30, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div className="t-xs c-3" style={{ marginTop: 6 }}>{sub}</div>
    </div>
  )
}

function SessionCard({ sess }: { sess: Session }): ReactNode {
  const s = useStore()
  return (
    <div
      className="card interactive"
      style={{ padding: 14 }}
      onClick={() => { void s.openSession(sess.id) }}
      role="button"
      tabIndex={0}
    >
      <div className="row gap-2" style={{ marginBottom: 10 }}>
        {sess.live && <span className="dot live" />}
        <div className="fw-600 truncate" style={{ fontSize: 14, flex: 1 }}>{sess.title}</div>
        {sess.pinned && <Icon name="pin" size={12} className="c-acc" />}
      </div>
      <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 10 }}>
        <span className="pill pill-ghost mono" style={{ fontSize: 10.5 }}>{sess.model}</span>
      </div>
      <div className="row gap-3 t-xs c-3">
        <span>{relTime(sess.updated)}</span>
        <span>·</span>
        <span>{sess.msgCount.toString()} msgs</span>
        <span>·</span>
        <span>{fmtTokens(sess.tokens)}</span>
        <div style={{ flex: 1 }} />
        <div className="progress" style={{ width: 40 }}>
          <span style={{ width: `${sess.contextPct.toString()}%` }} />
        </div>
        <span>{sess.contextPct}%</span>
      </div>
    </div>
  )
}

function BgTaskRow({ task }: { task: BgTask }): ReactNode {
  const done = task.status === 'done'
  const canc = task.status === 'cancelled'
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="row gap-2">
        {done ? (
          <Icon name="check" size={12} style={{ color: 'var(--green)' }} />
        ) : canc ? (
          <Icon name="close" size={12} className="c-3" />
        ) : (
          <span className="dot live" />
        )}
        <div className="t-sm fw-500 truncate flex-1">{task.title}</div>
      </div>
    </div>
  )
}

function PinnedSkillRow({ skill }: { skill: Skill }): ReactNode {
  const s = useStore()
  return (
    <div className="card" style={{ padding: 10 }}>
      <div className="row gap-2">
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 5,
            background: 'var(--paper-2)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="puzzle" size={13} />
        </div>
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="mono t-sm fw-600 truncate">{skill.name}</div>
          <div className="t-xs c-3 truncate">{skill.desc}</div>
        </div>
        <button
          className="btn btn-ghost btn-icon btn-sm has-tip"
          onClick={() => { void s.toggleSkillPinned(skill.id) }}
          aria-label="unpin skill"
        >
          <Icon name="pin" size={12} className="c-acc" />
        </button>
      </div>
    </div>
  )
}
