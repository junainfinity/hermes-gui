import type { CSSProperties, ReactNode } from 'react'

const ICONS: Record<string, ReactNode> = {
  // chat & messaging
  chat: <path d="M21 12a9 9 0 0 1-13.5 7.8L3 21l1.2-4.5A9 9 0 1 1 21 12Z" />,
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
    </>
  ),
  mic_off: (
    <>
      <path d="M5 10a7 7 0 0 0 11 5.5" />
      <path d="M15 10V5a3 3 0 0 0-6 0v2M12 17v4M8 21h8M2 2l20 20" />
    </>
  ),
  stop: <rect x="5" y="5" width="14" height="14" rx="2" />,
  sparkle: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />,

  // nav
  home: <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V10Z" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
    </>
  ),

  // actions
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  filter: <path d="M3 4h18l-7 9v6l-4-2v-4L3 4Z" />,
  more: (
    <>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </>
  ),
  more_v: (
    <>
      <circle cx="12" cy="5" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="12" cy="19" r="1.2" />
    </>
  ),
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />,
  copy: (
    <>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />,
  refresh: <path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" />,
  download: <path d="M12 3v13M6 11l6 6 6-6M5 21h14" />,
  upload: <path d="M12 21V8M6 12l6-6 6 6M5 3h14" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
    </>
  ),
  pin: <path d="m12 2 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />,

  // arrows
  arrow_up: <path d="M12 19V5M5 12l7-7 7 7" />,
  arrow_down: <path d="M12 5v14M5 12l7 7 7-7" />,
  arrow_left: <path d="M19 12H5M12 19l-7-7 7-7" />,
  arrow_right: <path d="M5 12h14M12 5l7 7-7 7" />,
  chev_down: <path d="m6 9 6 6 6-6" />,
  chev_up: <path d="m18 15-6-6-6 6" />,
  chev_right: <path d="m9 6 6 6-6 6" />,
  chev_left: <path d="m15 6-6 6 6 6" />,

  // system & status
  cog: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </>
  ),
  bell: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M13.7 21a2 2 0 0 1-3.4 0" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  shield: <path d="M12 2 4 5v7c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3Z" />,
  logout: <path d="M15 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5M10 17l-5-5 5-5M5 12h12" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,

  // features
  bolt: <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  tool: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2.8-.7-.7-2.8 2.3-2.3Z" />,
  brain: <path d="M9 3a3 3 0 0 0-3 3v1.2A3 3 0 0 0 4 10v1a3 3 0 0 0 0 6 3 3 0 0 0 3 3h2V3H9ZM15 3a3 3 0 0 1 3 3v1.2A3 3 0 0 1 20 10v1a3 3 0 0 1 0 6 3 3 0 0 1-3 3h-2V3h0Z" />,
  puzzle: <path d="M10 3a2 2 0 1 1 4 0v2h4a1 1 0 0 1 1 1v4a2 2 0 1 1 0 4v4a1 1 0 0 1-1 1h-4a2 2 0 1 0-4 0H6a1 1 0 0 1-1-1v-4a2 2 0 1 1 0-4V6a1 1 0 0 1 1-1h4V3Z" />,

  // connectors
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m7 9 3 3-3 3M13 15h4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
      <path d="M14 3v6h6" />
    </>
  ),
  plug: <path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0V8ZM12 14v4M10 22h4" />,
  github: <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-.9-2.3c3-.3 6-1.5 6-6.5a5 5 0 0 0-1.4-3.5A4.7 4.7 0 0 0 18.6 2s-1.1-.3-3.6 1.4A12 12 0 0 0 9 3.4C6.5 1.7 5.4 2 5.4 2a4.7 4.7 0 0 0-.1 3.2A5 5 0 0 0 4 8.7c0 5 3 6.2 6 6.5a3 3 0 0 0-.9 2.3V21" />,

  // media & dir
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),

  // slash & command
  slash: <path d="m15 4-6 16" />,
  at: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7" />
    </>
  ),

  // data
  dollar: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />,
  chart: <path d="M3 3v18h18M7 14l3-3 4 4 6-7" />,
  zap: <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </>
  ),
  warn: (
    <>
      <path d="m12 3 10 17H2L12 3Z" />
      <path d="M12 10v5M12 18h.01" />
    </>
  ),
}

export interface IconProps {
  name: string
  size?: number
  stroke?: number
  className?: string
  style?: CSSProperties
}

export function Icon({ name, size = 16, stroke = 1.5, className, style }: IconProps): ReactNode {
  const path = ICONS[name]
  if (!path) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {path}
    </svg>
  )
}

export function Logo({ size = 20 }: { size?: number }): ReactNode {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      aria-label="Hermes"
    >
      <path d="M9 6v20M23 6v20M9 16h14" />
      <path d="M6 10l-3 1M6 22l-3-1M26 10l3 1M26 22l3-1" strokeOpacity={0.5} />
    </svg>
  )
}
