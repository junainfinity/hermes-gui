import type { ReactNode } from 'react'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  size?: 'sm' | 'lg'
}

export function SectionHeader({ title, subtitle, right, size = 'lg' }: SectionHeaderProps): ReactNode {
  return (
    <div className="row gap-3" style={{ alignItems: 'flex-end', marginBottom: 14 }}>
      <div className="col" style={{ flex: 1, minWidth: 0 }}>
        <h2
          className="display"
          style={{
            margin: 0,
            fontSize: size === 'lg' ? 26 : 20,
            fontWeight: 400,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <div className="t-sm c-3" style={{ marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right}
    </div>
  )
}
