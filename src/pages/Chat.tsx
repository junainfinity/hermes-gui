import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { fmtCost, fmtTokens, relTime } from '@/lib/fmt'
import { Avatar } from '@/components/Avatar'
import type { Message, Session, ToolCall } from '@/types'

export function ChatPage(): ReactNode {
  const s = useStore()
  const sess = s.state.sessions.find((se) => se.id === s.state.activeSessionId)

  if (!sess) {
    return (
      <div style={{ padding: 40 }} className="c-3">
        No session selected.{' '}
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            s.newSession()
          }}
        >
          <Icon name="plus" size={12} /> Start one
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: s.state.leftPanelCollapsed ? '0 1fr' : '260px 1fr',
        height: '100%',
        minHeight: 0,
      }}
    >
      {!s.state.leftPanelCollapsed && <ChatSidebar />}
      <div className="col" style={{ minWidth: 0, minHeight: 0 }}>
        <ChatTabs />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: s.state.rightPanel === 'hidden' ? '1fr' : '1fr 340px',
            flex: 1,
            minHeight: 0,
          }}
        >
          <ChatMain sess={sess} />
          {s.state.rightPanel !== 'hidden' && <ChatRightPanel sess={sess} />}
        </div>
      </div>
    </div>
  )
}

function ChatSidebar(): ReactNode {
  const s = useStore()
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const term = q.toLowerCase()
    return s.state.sessions.filter((se) => !term || se.title.toLowerCase().includes(term))
  }, [q, s.state.sessions])

  return (
    <aside
      style={{
        borderRight: '1px solid var(--line-soft)',
        background: 'var(--paper-1)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-soft)' }}>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => {
            s.newSession()
          }}
        >
          <Icon name="plus" size={13} /> New session
        </button>
        <div className="input" style={{ marginTop: 8, padding: '5px 8px' }}>
          <Icon name="search" size={13} className="c-3" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
            }}
            placeholder="Search sessions…"
            style={{ fontSize: 12 }}
          />
        </div>
      </div>
      <div className="scroll" style={{ padding: 6 }}>
        {filtered.map((se) => (
          <button
            key={se.id}
            onClick={() => {
              void s.openSession(se.id)
            }}
            className={s.state.activeSessionId === se.id ? 'active' : ''}
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              width: '100%',
              padding: '7px 8px',
              borderRadius: 6,
              textAlign: 'left',
              background: s.state.activeSessionId === se.id ? 'var(--paper-3)' : 'transparent',
              color: s.state.activeSessionId === se.id ? 'var(--ink)' : 'var(--ink-2)',
              fontSize: 13,
              cursor: 'pointer',
              border: 'none',
              marginBottom: 2,
            }}
          >
            {se.live ? (
              <span className="dot live" />
            ) : (
              <Icon name="chat" size={11} className="c-3" />
            )}
            <span className="truncate flex-1">{se.title}</span>
            {se.pinned && <Icon name="pin" size={10} className="c-acc" />}
          </button>
        ))}
      </div>
    </aside>
  )
}

function ChatTabs(): ReactNode {
  const s = useStore()
  const tabs = s.state.openTabs
    .map((id) => s.state.sessions.find((se) => se.id === id))
    .filter((se): se is Session => se !== undefined)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 40,
        borderBottom: '1px solid var(--line-soft)',
        background: 'var(--paper-1)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <div className="row" style={{ overflow: 'auto', flex: 1 }}>
        {tabs.map((se) => (
          <ChatTab key={se.id} sess={se} active={se.id === s.state.activeSessionId} />
        ))}
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            s.newSession()
          }}
          style={{ margin: '4px 6px' }}
          aria-label="new tab"
        >
          <Icon name="plus" size={13} />
        </button>
      </div>
      <div className="row gap-1" style={{ padding: '0 8px', borderLeft: '1px solid var(--line-soft)' }}>
        <button
          className={`btn btn-sm ${s.state.rightPanel === 'tools' ? 'active' : 'btn-ghost'}`}
          onClick={() => {
            s.setRightPanel(s.state.rightPanel === 'tools' ? 'hidden' : 'tools')
          }}
        >
          <Icon name="tool" size={13} /> Tools
        </button>
        <button
          className={`btn btn-sm ${s.state.rightPanel === 'inspector' ? 'active' : 'btn-ghost'}`}
          onClick={() => {
            s.setRightPanel(s.state.rightPanel === 'inspector' ? 'hidden' : 'inspector')
          }}
        >
          <Icon name="info" size={13} /> Info
        </button>
      </div>
    </div>
  )
}

function ChatTab({ sess, active }: { sess: Session; active: boolean }): ReactNode {
  const s = useStore()
  return (
    <div
      onClick={() => {
        s.setActiveTab(sess.id)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 12px',
        borderRight: '1px solid var(--line-soft)',
        background: active ? 'var(--paper)' : 'transparent',
        borderTop: active ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        fontSize: 12.5,
        color: active ? 'var(--ink)' : 'var(--ink-3)',
      }}
    >
      {sess.live ? <span className="dot live" /> : <Icon name="chat" size={11} className="c-3" />}
      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {sess.title}
      </span>
      <button
        className="btn btn-ghost btn-icon btn-sm"
        style={{ width: 18, height: 18, padding: 0 }}
        onClick={(e) => {
          e.stopPropagation()
          s.closeTab(sess.id)
        }}
        aria-label="close tab"
      >
        <Icon name="close" size={10} />
      </button>
    </div>
  )
}

function ChatMain({ sess }: { sess: Session }): ReactNode {
  const s = useStore()
  return (
    <div className="col" style={{ minWidth: 0, minHeight: 0, background: 'var(--paper)' }}>
      <div
        className="row gap-3"
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid var(--line-soft)',
          flexShrink: 0,
        }}
      >
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="row gap-2">
            <h2
              style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.005em' }}
              className="truncate"
            >
              {sess.title}
            </h2>
            {sess.live && (
              <span className="pill pill-accent">
                <span className="dot live" /> live
              </span>
            )}
          </div>
          <div className="row gap-2 t-xs c-3" style={{ marginTop: 3 }}>
            <span className="mono">{sess.model}</span>
            <span>·</span>
            <span>{sess.personality}</span>
            <span>·</span>
            <span>{sess.msgCount.toString()} messages</span>
            <span>·</span>
            <span>{relTime(sess.updated)}</span>
          </div>
        </div>
        <button
          className="btn btn-sm btn-ghost"
          onClick={() => {
            void s.exportSession(sess.id).then((md) => {
              const blob = new Blob([md], { type: 'text/markdown' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${sess.title}.md`
              a.click()
              URL.revokeObjectURL(url)
            }).catch((err: unknown) => {
              s.toast(err instanceof Error ? err.message : 'export failed')
            })
          }}
        >
          <Icon name="download" size={13} /> Export
        </button>
      </div>

      <ChatMessages sess={sess} />
      <ChatComposer sess={sess} />
    </div>
  )
}

function ChatMessages({ sess }: { sess: Session }): ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastText = sess.messages[sess.messages.length - 1]?.text
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [sess.messages.length, lastText])

  return (
    <div ref={scrollRef} className="scroll" style={{ flex: 1, padding: '22px 20px 16px', minHeight: 0 }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }} className="col gap-4">
        {sess.messages.length === 0 && <EmptyChat />}
        {sess.messages.map((m, i) => (
          <MessageView key={m.id ?? i} msg={m} />
        ))}
        {sess.live && <ThinkingBubble />}
      </div>
    </div>
  )
}

function EmptyChat(): ReactNode {
  return (
    <div className="col gap-3" style={{ padding: '60px 20px', alignItems: 'center', textAlign: 'center' }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'var(--paper-2)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon name="sparkle" size={22} className="c-3" />
      </div>
      <h3 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 400 }}>
        How can I help?
      </h3>
      <div className="t-sm c-3" style={{ maxWidth: 380 }}>
        Ask anything. Use <span className="kbd">/</span> for commands.
      </div>
    </div>
  )
}

const TOOL_ICON: Record<ToolCall['tool'], string> = {
  terminal: 'terminal',
  web: 'globe',
  file: 'file',
  github: 'github',
  search: 'search',
  other: 'tool',
}

function MessageView({ msg }: { msg: Message }): ReactNode {
  if (msg.role === 'user') {
    return (
      <div className="row gap-2" style={{ justifyContent: 'flex-end' }}>
        <div
          style={{
            maxWidth: '78%',
            padding: '10px 14px',
            background: 'var(--ink)',
            color: 'var(--paper)',
            borderRadius: 14,
            borderBottomRightRadius: 4,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {msg.text}
        </div>
      </div>
    )
  }
  if (msg.role === 'system' || msg.role === 'tool') return null
  return (
    <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
      <Avatar letter="H" size={28} tone="accent" />
      <div className="col gap-2" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>
          {msg.text}
        </div>
        {msg.tools && msg.tools.length > 0 && (
          <div className="card" style={{ background: 'var(--paper-1)', padding: '8px 10px' }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name="tool" size={12} className="c-3" />
              <span className="t-xs c-3 fw-600 uppercase">Tool calls</span>
            </div>
            <div className="col gap-1">
              {msg.tools.map((t, i) => (
                <div key={i} className="row gap-2" style={{ fontSize: 12 }}>
                  <Icon name={TOOL_ICON[t.tool]} size={11} className="c-3" />
                  <span className="mono c-2">{t.tool}</span>
                  <span className="c-3 mono truncate flex-1">{t.call}</span>
                  {t.dur !== undefined && (
                    <span className="t-xs c-4 mono">{t.dur.toFixed(1)}s</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ThinkingBubble(): ReactNode {
  return (
    <div className="row gap-3" style={{ alignItems: 'center' }}>
      <Avatar letter="H" size={28} tone="accent" />
      <div className="row gap-2 t-sm c-3" style={{ fontStyle: 'italic' }}>
        <span>thinking</span>
        <span className="row gap-1">
          <span className="dot live" />
          <span className="dot live" style={{ animationDelay: '.2s' }} />
          <span className="dot live" style={{ animationDelay: '.4s' }} />
        </span>
      </div>
    </div>
  )
}

function ChatComposer({ sess }: { sess: Session }): ReactNode {
  const s = useStore()
  const [text, setText] = useState('')
  const [slashOpen, setSlashOpen] = useState(false)
  const slashMatches = useMemo(() => {
    if (!text.startsWith('/')) return []
    const q = text.slice(1).toLowerCase()
    return s.state.slashCommands.filter((c) => c.cmd.slice(1).startsWith(q)).slice(0, 6)
  }, [text, s.state.slashCommands])
  useEffect(() => {
    setSlashOpen(slashMatches.length > 0)
  }, [slashMatches.length])

  const send = async (): Promise<void> => {
    const t = text.trim()
    if (!t) return
    setText('')
    await s.sendMessage(sess.id, t)
  }

  return (
    <div
      style={{
        padding: '12px 20px 16px',
        borderTop: '1px solid var(--line-soft)',
        flexShrink: 0,
        background: 'var(--paper)',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
        {slashOpen && (
          <div
            className="slide-up"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              boxShadow: 'var(--shadow-md)',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            <div className="uppercase t-xs c-4 fw-600" style={{ padding: '8px 12px 4px' }}>
              Slash commands
            </div>
            {slashMatches.map((c) => (
              <div
                key={c.cmd}
                onClick={() => {
                  setText(c.cmd + ' ')
                }}
                style={{ display: 'flex', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
              >
                <Icon name="slash" size={12} className="c-3" />
                <span className="mono fw-600 t-sm">{c.cmd}</span>
                <span className="c-3 t-sm truncate flex-1">{c.desc}</span>
              </div>
            ))}
          </div>
        )}

        <div className="input" style={{ padding: 12, alignItems: 'stretch', flexDirection: 'column' }}>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            rows={text.includes('\n') ? 3 : 1}
            placeholder={`Message ${sess.title}…  (type / for commands)`}
            style={{
              resize: 'none',
              width: '100%',
              background: 'transparent',
              fontSize: 14,
              color: 'var(--ink)',
              minHeight: 24,
              border: 'none',
            }}
          />
          <div className="row gap-2" style={{ marginTop: 8 }}>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setText('/')
              }}
            >
              <Icon name="slash" size={13} /> /
            </button>
            <div style={{ flex: 1 }} />
            <span className="t-xs c-4">{sess.model}</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { void send() }}
              disabled={!text.trim()}
              style={{ opacity: text.trim() ? 1 : 0.5 }}
            >
              <Icon name="send" size={12} /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatRightPanel({ sess }: { sess: Session }): ReactNode {
  const s = useStore()
  if (s.state.rightPanel === 'tools') return <ToolStreamPanel sess={sess} />
  return <InspectorPanel sess={sess} />
}

function ToolStreamPanel({ sess }: { sess: Session }): ReactNode {
  const all = sess.messages.flatMap((m) => m.tools ?? [])
  return (
    <aside
      style={{
        borderLeft: '1px solid var(--line-soft)',
        background: 'var(--paper-1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div className="row gap-2" style={{ padding: '10px 14px', borderBottom: '1px solid var(--line-soft)' }}>
        <Icon name="tool" size={14} />
        <div className="fw-600" style={{ fontSize: 13 }}>Tool stream</div>
        <div style={{ flex: 1 }} />
        <span className="pill pill-ghost" style={{ fontSize: 10 }}>{all.length.toString()} calls</span>
      </div>
      <div className="scroll" style={{ padding: 12, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
        {all.length === 0 && (
          <div className="c-3 t-sm" style={{ fontFamily: 'var(--font-sans)' }}>
            No tool calls yet.
          </div>
        )}
        {all.map((t, i) => (
          <div key={i} className="card" style={{ padding: 10, marginBottom: 8, background: 'var(--paper)' }}>
            <div className="row gap-2" style={{ marginBottom: 6 }}>
              <Icon name={TOOL_ICON[t.tool]} size={11} className="c-3" />
              <span className="c-2 fw-600">{t.tool}</span>
              <div style={{ flex: 1 }} />
              {t.dur !== undefined && <span className="c-4">{t.dur.toFixed(1)}s</span>}
            </div>
            <div className="c-3" style={{ lineHeight: 1.5, wordBreak: 'break-word' }}>$ {t.call}</div>
          </div>
        ))}
      </div>
    </aside>
  )
}

function InspectorPanel({ sess }: { sess: Session }): ReactNode {
  const s = useStore()
  return (
    <aside
      style={{
        borderLeft: '1px solid var(--line-soft)',
        background: 'var(--paper-1)',
        overflow: 'auto',
        padding: 16,
      }}
    >
      <div className="fw-600" style={{ fontSize: 13, marginBottom: 10 }}>Session info</div>
      <div className="col gap-3" style={{ fontSize: 12 }}>
        <InfoRow label="Model" value={sess.model} />
        <InfoRow label="Personality" value={sess.personality} />
        <InfoRow label="Tokens" value={`${fmtTokens(sess.tokens)} / 200K`} />
        <InfoRow label="Cost" value={fmtCost(sess.cost)} />
        <InfoRow label="Messages" value={sess.msgCount.toString()} />
        <InfoRow label="Updated" value={relTime(sess.updated)} />
      </div>
      <div className="hr" style={{ margin: '16px 0' }} />
      <div className="fw-600" style={{ fontSize: 13, marginBottom: 8 }}>Context</div>
      <div className="progress">
        <span style={{ width: `${sess.contextPct.toString()}%` }} />
      </div>
      <div className="t-xs c-3" style={{ marginTop: 4 }}>
        {sess.contextPct}% used · auto-compress at {s.state.settings.compressionThreshold}%
      </div>
    </aside>
  )
}

function InfoRow({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className="row gap-2">
      <span className="c-3 uppercase fw-600" style={{ fontSize: 10, letterSpacing: '.06em', width: 86 }}>
        {label}
      </span>
      <span className="mono">{value}</span>
    </div>
  )
}
