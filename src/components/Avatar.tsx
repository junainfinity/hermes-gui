import type { ReactNode } from 'react'

export interface AvatarProps {
  letter?: string
  size?: number
  tone?: 'ink' | 'accent' | 'paper'
}

export function Avatar({ letter = 'a', size = 24, tone = 'ink' }: AvatarProps): ReactNode {
  const bg =
    tone === 'accent' ? 'var(--accent)' : tone === 'ink' ? 'var(--ink)' : 'var(--paper-3)'
  const color = tone === 'paper' ? 'var(--ink)' : 'var(--paper)'
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        flexShrink: 0,
        background: bg,
        color,
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.45,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
      }}
      aria-hidden="true"
    >
      {letter.toUpperCase()}
    </div>
  )
}
