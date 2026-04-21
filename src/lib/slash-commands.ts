import type { SlashCommand } from '@/types'

/** Built-in slash commands that mirror Hermes' ACP advertisements + UI shortcuts. */
export const BUILT_IN_SLASH_COMMANDS: SlashCommand[] = [
  { cmd: '/background', desc: 'Run this prompt in a separate background session' },
  { cmd: '/compress', desc: 'Summarize middle turns to reclaim context' },
  { cmd: '/model', desc: 'Switch the current model' },
  { cmd: '/skills', desc: 'Browse & install skills' },
  { cmd: '/voice', desc: 'Toggle voice mode (⌃B to record)' },
  { cmd: '/resume', desc: 'Resume a previous session' },
  { cmd: '/personality', desc: 'Change conversational style' },
  { cmd: '/clear', desc: 'Clear current session' },
  { cmd: '/export', desc: 'Export session as markdown' },
  { cmd: '/share', desc: 'Create a shareable link' },
]
