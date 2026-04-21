import type { ReactNode } from 'react'
import { Icon } from '@/icons/Icon'
import { useStore } from '@/store/hooks'

export function Toast(): ReactNode {
  const s = useStore()
  if (!s.state.toast) return null
  return (
    <div
      className="slide-up"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 40,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '8px 14px',
        borderRadius: 999,
        fontSize: 13,
        zIndex: 400,
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Icon name="check" size={14} style={{ color: 'var(--accent)' }} />
      <span>{s.state.toast.msg}</span>
    </div>
  )
}
