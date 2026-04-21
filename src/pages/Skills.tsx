import { useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { SectionHeader } from '@/components/SectionHeader'
import type { Skill } from '@/types'

type Tab = 'installed' | 'browse'

export function SkillsPage(): ReactNode {
  const s = useStore()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState<Tab>('installed')

  const filtered = s.state.skills.filter((sk) => {
    if (tab === 'installed' && !sk.installed) return false
    if (tab === 'browse' && sk.installed) return false
    if (q && !(sk.name + ' ' + sk.desc).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const pinned = filtered.filter((sk) => sk.pinned)
  const others = filtered.filter((sk) => !sk.pinned)

  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionHeader
          title="Skills hub"
          subtitle={`${s.state.skills.filter((x) => x.installed).length.toString()} installed · ${s.state.skills.filter((x) => x.pinned).length.toString()} pinned`}
        />

        <div className="row gap-2" style={{ marginBottom: 18 }}>
          <div className="input" style={{ minWidth: 260, flex: 1 }}>
            <Icon name="search" size={13} className="c-3" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value) }}
              placeholder="Search skills…"
            />
          </div>
          <div className="row gap-1">
            {(['installed', 'browse'] satisfies Tab[]).map((k) => (
              <button
                key={k}
                className={`btn btn-sm ${tab === k ? 'active' : 'btn-ghost'}`}
                onClick={() => { setTab(k) }}
              >
                {k === 'installed' ? 'Installed' : 'Browse hub'}
              </button>
            ))}
          </div>
        </div>

        {tab === 'installed' && pinned.length > 0 && (
          <>
            <div className="uppercase t-xs c-3 fw-600" style={{ marginBottom: 10 }}>Pinned</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
              {pinned.map((sk) => <SkillCard key={sk.id} skill={sk} />)}
            </div>
          </>
        )}
        <div className="uppercase t-xs c-3 fw-600" style={{ marginBottom: 10 }}>
          {tab === 'installed' ? 'All installed' : 'Available'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {others.map((sk) => <SkillCard key={sk.id} skill={sk} />)}
        </div>
        {filtered.length === 0 && (
          <div className="c-3" style={{ padding: 40, textAlign: 'center' }}>
            No skills match.
          </div>
        )}
      </div>
    </div>
  )
}

function SkillCard({ skill }: { skill: Skill }): ReactNode {
  const s = useStore()
  return (
    <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="row gap-2">
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            background: 'var(--paper-2)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name="puzzle" size={15} />
        </div>
        <div className="col flex-1" style={{ minWidth: 0 }}>
          <div className="mono fw-600 truncate" style={{ fontSize: 13 }}>{skill.name}</div>
          <div className="t-xs c-3 truncate">v{skill.version} · {skill.author}</div>
        </div>
        {skill.installed && (
          <button
            className="btn btn-ghost btn-icon btn-sm has-tip"
            onClick={() => { void s.toggleSkillPinned(skill.id) }}
            aria-label={skill.pinned ? 'unpin skill' : 'pin skill'}
          >
            <Icon name="pin" size={12} className={skill.pinned ? 'c-acc' : 'c-3'} />
          </button>
        )}
      </div>
      <div className="t-sm c-2 clamp-2" style={{ minHeight: 36 }}>{skill.desc}</div>
      <div className="row gap-2">
        <span className="pill" style={{ fontSize: 10 }}>{skill.category}</span>
        <div style={{ flex: 1 }} />
        {skill.installed ? (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { void s.toggleSkillInstalled(skill.id) }}
          >
            Uninstall
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { void s.toggleSkillInstalled(skill.id) }}
          >
            <Icon name="download" size={11} /> Install
          </button>
        )}
      </div>
    </div>
  )
}
