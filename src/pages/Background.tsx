import { useState, type ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'
import { fmtSecs } from '@/lib/fmt'
import { SectionHeader } from '@/components/SectionHeader'
import type { BgTask } from '@/types'

export function BackgroundPage(): ReactNode {
  const s = useStore()
  const [prompt, setPrompt] = useState('')
  const running = s.state.bgTasks.filter((t) => t.status === 'running')
  const done = s.state.bgTasks.filter((t) => t.status === 'done')
  const other = s.state.bgTasks.filter((t) => t.status !== 'running' && t.status !== 'done')

  const queue = async (): Promise<void> => {
    const t = prompt.trim()
    if (!t) return
    setPrompt('')
    await s.addBgTask(t)
    s.toast('queued')
  }

  return (
    <div className="scroll full" style={{ padding: 32 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <SectionHeader
          title="Background tasks"
          subtitle={`${running.length.toString()} running · ${done.length.toString()} done`}
        />

        <div className="card" style={{ padding: 12, marginBottom: 20 }}>
          <div className="row gap-2">
            <Icon name="zap" size={14} className="c-acc" />
            <input
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim()) {
                  e.preventDefault()
                  void queue()
                }
              }}
              placeholder="Queue a new background task… (e.g. summarize my open PRs)"
              style={{ flex: 1, fontSize: 14 }}
            />
            <button
              className="btn btn-primary btn-sm"
              disabled={!prompt.trim()}
              onClick={() => { void queue() }}
              style={{ opacity: prompt.trim() ? 1 : 0.5 }}
            >
              <Icon name="send" size={12} /> Queue
            </button>
          </div>
        </div>

        {running.length > 0 && <BgGroup label="Running" items={running} />}
        {done.length > 0 && <BgGroup label="Completed" items={done} />}
        {other.length > 0 && <BgGroup label="Other" items={other} />}
        {s.state.bgTasks.length === 0 && (
          <div className="c-3" style={{ padding: 40, textAlign: 'center' }}>
            No background tasks.
          </div>
        )}
      </div>
    </div>
  )
}

function BgGroup({ label, items }: { label: string; items: BgTask[] }): ReactNode {
  const s = useStore()
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="uppercase t-xs c-3 fw-600" style={{ marginBottom: 10 }}>{label}</div>
      <div className="col gap-2">
        {items.map((t) => (
          <div key={t.id} className="card" style={{ padding: 14 }}>
            <div className="row gap-2" style={{ marginBottom: 8 }}>
              {t.status === 'done' ? (
                <Icon name="check" size={13} style={{ color: 'var(--green)' }} />
              ) : t.status === 'cancelled' ? (
                <Icon name="close" size={13} className="c-3" />
              ) : t.status === 'failed' ? (
                <Icon name="warn" size={13} style={{ color: 'var(--red)' }} />
              ) : (
                <span className="dot live" />
              )}
              <div className="fw-500 flex-1 truncate">{t.title}</div>
              <span className="pill mono" style={{ fontSize: 10 }}>{t.model}</span>
              <span className="t-xs c-4 mono">{fmtSecs(t.elapsed)}</span>
            </div>
            {t.status === 'running' && (
              <div className="row gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { s.cancelBgTask(t.id) }}
                >
                  <Icon name="close" size={11} /> Cancel
                </button>
              </div>
            )}
            {t.status === 'done' && t.output && (
              <div
                className="card"
                style={{ padding: 10, background: 'var(--paper-1)', fontSize: 12, whiteSpace: 'pre-wrap' }}
              >
                {t.output.slice(0, 500)}
                {t.output.length > 500 && '…'}
              </div>
            )}
            {t.error && (
              <div className="t-sm" style={{ color: 'var(--red)' }}>
                {t.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
