import type { ReactNode } from 'react'
import { useStore } from '@/store/hooks'
import { fmtCost, fmtTokens } from '@/lib/fmt'

export function StatusBar(): ReactNode {
  const s = useStore()
  const sess = s.state.sessions.find((x) => x.id === s.state.activeSessionId)
  const running = s.state.bgTasks.filter((t) => t.status === 'running').length
  const connected = !s.state.bootError
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line-soft)',
        background: 'var(--paper-1)',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        fontSize: 11,
        color: 'var(--ink-3)',
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span className="row gap-1">
        <span className={`dot ${connected ? 'green' : 'red'}`} />
        {connected ? 'connected' : 'disconnected'} · {s.state.settings.provider || '—'}
      </span>
      <span>·</span>
      <span>{s.state.settings.model || '—'}</span>
      {sess && (
        <>
          <span>·</span>
          <span>{fmtTokens(sess.tokens)} / 200K</span>
          <div className="progress" style={{ width: 70 }}>
            <span style={{ width: `${sess.contextPct.toString()}%` }} />
          </div>
          <span>{sess.contextPct}%</span>
          <span>·</span>
          <span>{fmtCost(sess.cost)}</span>
        </>
      )}
      <span>·</span>
      <span>bg: {running} running</span>
      <div style={{ flex: 1 }} />
      <span>⌘K palette</span>
      <span>·</span>
      <span>⌃B voice</span>
      <span>·</span>
      <span>v0.1.0-alpha</span>
    </footer>
  )
}
