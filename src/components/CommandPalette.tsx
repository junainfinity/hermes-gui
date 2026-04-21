import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { relTime } from '@/lib/fmt'
import type { RouteName } from '@/types'

interface ResultItem {
  kind: string
  icon: string
  title: string
  hint?: string
  badge?: string
  run: () => void
}

interface ResultGroup {
  label: string
  items: ResultItem[]
}

export function CommandPalette(): ReactNode {
  const s = useStore()
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (s.state.commandOpen) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [s.state.commandOpen])

  const groups = useMemo<ResultGroup[]>(() => {
    const term = q.trim().toLowerCase()
    const match = (t: string): boolean => !term || t.toLowerCase().includes(term)

    const nav: ResultItem[] = (
      [
        ['home', 'Go to Home', 'dashboard'],
        ['chat', 'Go to Chat', 'current session'],
        ['sessions', 'Browse sessions', 'history'],
        ['skills', 'Skills hub', 'install, pin'],
        ['background', 'Background tasks', "what's running"],
        ['settings', 'Open settings', 'model, voice'],
      ] satisfies [RouteName, string, string][]
    )
      .filter(([_n, title, hint]) => match(`${title} ${hint}`))
      .map(([name, title, hint]) => ({
        kind: 'nav',
        icon: name === 'home' ? 'home' : name === 'chat' ? 'chat' : name === 'sessions' ? 'history' : name === 'skills' ? 'puzzle' : name === 'background' ? 'bolt' : 'cog',
        title,
        hint,
        run: () => { s.navigate(name) },
      }))

    const sessions: ResultItem[] = s.state.sessions
      .filter((se) => match(se.title))
      .slice(0, 6)
      .map((se) => ({
        kind: 'session',
        icon: 'history',
        title: se.title,
        hint: `${relTime(se.updated)} · ${se.model} · ${se.msgCount.toString()} msgs`,
        badge: se.live ? 'live' : se.pinned ? 'pinned' : undefined,
        run: () => { void s.openSession(se.id) },
      } satisfies ResultItem))

    const isSlash = term.startsWith('/')
    const slash: ResultItem[] = s.state.slashCommands
      .filter((c) => match(c.cmd) || (isSlash && c.cmd.slice(1).startsWith(term.slice(1))))
      .slice(0, 6)
      .map((c) => ({
        kind: 'command',
        icon: 'slash',
        title: c.cmd,
        hint: c.desc,
        run: () => {
          switch (c.cmd) {
            case '/voice': s.toggleVoice(); break
            case '/skills': s.navigate('skills'); break
            case '/background': s.navigate('background'); break
            case '/model':
            case '/personality':
              s.navigate('settings'); break
            case '/resume': s.navigate('sessions'); break
            default: s.toast(`ran ${c.cmd}`)
          }
        },
      }))

    const skills: ResultItem[] = s.state.skills
      .filter((sk) => match(sk.name + ' ' + sk.desc))
      .slice(0, 4)
      .map((sk) => ({
        kind: 'skill',
        icon: 'puzzle',
        title: sk.name,
        hint: sk.desc,
        badge: sk.installed ? (sk.pinned ? 'pinned' : 'installed') : 'install',
        run: () => {
          if (!sk.installed) void s.toggleSkillInstalled(sk.id)
          else s.navigate('skills')
        },
      }))

    const actions: ResultItem[] = [
      {
        kind: 'action',
        icon: 'plus',
        title: 'New session',
        hint: 'start a fresh chat',
        run: () => { s.newSession() },
      },
      {
        kind: 'action',
        icon: 'zap',
        title: q.trim() ? `Run in background: "${q.trim()}"` : 'Run in background',
        hint: '/background',
        run: () => {
          if (q.trim()) {
            void s.addBgTask(q.trim())
            s.toast('queued to background')
          } else s.navigate('background')
        },
      },
      {
        kind: 'action',
        icon: 'moon',
        title: `Toggle theme (${s.state.settings.dark ? 'light' : 'dark'})`,
        hint: 'appearance',
        run: () => { s.setSetting('dark', !s.state.settings.dark) },
      },
    ].filter((a) => match(a.title + ' ' + a.hint))

    const out: ResultGroup[] = []
    if (actions.length) out.push({ label: 'Actions', items: actions })
    if (slash.length) out.push({ label: 'Commands', items: slash })
    if (sessions.length) out.push({ label: 'Sessions', items: sessions })
    if (skills.length) out.push({ label: 'Skills', items: skills })
    if (nav.length) out.push({ label: 'Navigate', items: nav })
    return out
  }, [q, s])

  const flat = groups.flatMap((g) => g.items)

  const onKey = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      s.closeCmd()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((x) => Math.min(flat.length - 1, x + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((x) => Math.max(0, x - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      flat[sel]?.run()
      s.closeCmd()
    }
  }

  if (!s.state.commandOpen) return null

  let idx = 0
  return (
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'color-mix(in oklab, var(--ink) 35%, transparent)',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        placeItems: 'start center',
        paddingTop: '12vh',
      }}
      onClick={s.closeCmd}
    >
      <div
        className="slide-up"
        onClick={(e) => { e.stopPropagation() }}
        style={{
          width: 'min(640px, calc(100vw - 40px))',
          background: 'var(--paper)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--line)',
          overflow: 'hidden',
        }}
      >
        <div className="row gap-2" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)' }}>
          <Icon name="search" size={16} className="c-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setSel(0)
            }}
            onKeyDown={onKey}
            placeholder="Ask, run, /command, resume a session…"
            style={{ flex: 1, fontSize: 15, background: 'transparent', color: 'var(--ink)', border: 'none' }}
          />
          <span className="kbd">esc</span>
        </div>

        <div className="scroll" style={{ maxHeight: 420, padding: 6 }}>
          {flat.length === 0 && (
            <div className="col gap-2" style={{ padding: '30px 20px', alignItems: 'center', color: 'var(--ink-3)' }}>
              <Icon name="search" size={24} />
              <div className="t-sm">No results for &quot;{q}&quot;</div>
            </div>
          )}
          {groups.map((g) => (
            <div key={g.label} style={{ marginTop: 4 }}>
              <div className="uppercase t-xs c-4" style={{ padding: '6px 10px 2px', fontWeight: 600 }}>
                {g.label}
              </div>
              {g.items.map((r) => {
                const i = idx++
                const on = i === sel
                return (
                  <div
                    key={i}
                    onMouseEnter={() => { setSel(i) }}
                    onClick={() => {
                      r.run()
                      s.closeCmd()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 6,
                      margin: '1px 4px',
                      background: on ? 'var(--paper-2)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name={r.icon} size={15} className={on ? 'c-1' : 'c-3'} />
                    <span className="fw-500 truncate" style={{ fontSize: 13 }}>{r.title}</span>
                    {r.hint && (
                      <span className="t-sm c-4 truncate" style={{ flex: 1 }}>
                        · {r.hint}
                      </span>
                    )}
                    {r.badge && <span className="pill">{r.badge}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
