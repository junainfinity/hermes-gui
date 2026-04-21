import { useMemo, useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { fmtCost, fmtTokens, relTime } from '@/lib/fmt'
import { SectionHeader } from '@/components/SectionHeader'

type Filter = 'all' | 'active' | 'pinned' | 'archived'
type Sort = 'recent' | 'tokens' | 'cost'

export function SessionsPage(): ReactNode {
  const s = useStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('recent')

  const list = useMemo(() => {
    let l = [...s.state.sessions]
    if (filter === 'active') l = l.filter((x) => x.live)
    if (filter === 'pinned') l = l.filter((x) => x.pinned)
    if (filter === 'archived') l = l.filter((x) => x.archived)
    if (q) l = l.filter((x) => x.title.toLowerCase().includes(q.toLowerCase()))
    if (sort === 'recent') l.sort((a, b) => b.updated - a.updated)
    if (sort === 'tokens') l.sort((a, b) => b.tokens - a.tokens)
    if (sort === 'cost') l.sort((a, b) => b.cost - a.cost)
    return l
  }, [s.state.sessions, q, filter, sort])

  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionHeader
          title="Sessions"
          subtitle={`${s.state.sessions.length.toString()} total · ${s.state.sessions.filter((x) => x.live).length.toString()} live · ${s.state.sessions.filter((x) => x.archived).length.toString()} archived`}
          right={
            <button className="btn btn-primary btn-sm" onClick={() => { s.newSession() }}>
              <Icon name="plus" size={12} /> New session
            </button>
          }
        />
        <div className="row gap-2" style={{ marginBottom: 18, flexWrap: 'wrap' }}>
          <div className="input" style={{ minWidth: 260, flex: 1 }}>
            <Icon name="search" size={13} className="c-3" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value) }}
              placeholder="Search sessions by title…"
            />
          </div>
          <div className="row gap-1">
            {(['all', 'active', 'pinned', 'archived'] satisfies Filter[]).map((k) => (
              <button
                key={k}
                className={`btn btn-sm ${filter === k ? 'active' : 'btn-ghost'}`}
                onClick={() => { setFilter(k) }}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="row gap-1">
            <span className="t-sm c-3">sort:</span>
            {(['recent', 'tokens', 'cost'] satisfies Sort[]).map((k) => (
              <button
                key={k}
                className={`btn btn-sm ${sort === k ? 'active' : 'btn-ghost'}`}
                onClick={() => { setSort(k) }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr) 140px 110px 90px 70px 120px 40px',
              padding: '10px 14px',
              borderBottom: '1px solid var(--line-soft)',
              fontSize: 11,
              color: 'var(--ink-3)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            <span>Title</span>
            <span>Model</span>
            <span>Updated</span>
            <span>Tokens</span>
            <span>Cost</span>
            <span>Context</span>
            <span aria-hidden="true" />
          </div>
          {list.map((se) => (
            <div
              key={se.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0,1fr) 140px 110px 90px 70px 120px 40px',
                padding: '10px 14px',
                borderBottom: '1px solid var(--line-soft)',
                alignItems: 'center',
                fontSize: 13,
                cursor: 'pointer',
              }}
              onClick={() => { void s.openSession(se.id) }}
            >
              <div className="row gap-2" style={{ minWidth: 0 }}>
                {se.live ? (
                  <span className="dot live" />
                ) : (
                  <Icon name="chat" size={12} className="c-3" />
                )}
                <span className="truncate fw-500">{se.title}</span>
                {se.pinned && <Icon name="pin" size={11} className="c-acc" />}
              </div>
              <span className="mono t-sm c-2 truncate">{se.model}</span>
              <span className="t-sm c-3">{relTime(se.updated)}</span>
              <span className="t-sm mono">{fmtTokens(se.tokens)}</span>
              <span className="t-sm mono">{fmtCost(se.cost)}</span>
              <div className="row gap-2">
                <div className="progress" style={{ flex: 1 }}>
                  <span style={{ width: `${se.contextPct.toString()}%` }} />
                </div>
                <span className="t-xs c-3">{se.contextPct}%</span>
              </div>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  void s.deleteSession(se.id)
                }}
                aria-label="delete session"
              >
                <Icon name="trash" size={12} />
              </button>
            </div>
          ))}
          {list.length === 0 && (
            <div className="c-3" style={{ padding: 40, textAlign: 'center' }}>
              No sessions match.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
