// Hermes App — data layer: seed state + tiny store.
// All app state lives in a single reducer-ish object, persisted to localStorage.

const NOW = Date.now();
const MIN = 60 * 1000, HR = 60 * MIN, DAY = 24 * HR;

// ── Seed data ────────────────────────────────────────────────────────

const SEED_SESSIONS = [
  {
    id: 's1',
    title: 'refactoring auth middleware',
    model: 'claude-sonnet-4',
    personality: 'concise',
    skills: ['github-pr-workflow', 'github-auth'],
    pinned: true,
    live: true,
    tokens: 12_400, cost: 0.06, contextPct: 6, msgCount: 28,
    updated: NOW - 20 * 1000,
    messages: [
      { role: 'user', text: 'Can you walk through how our session cookies are validated right now? I want to move to PKCE.' },
      { role: 'assistant', text: "Here's the current flow — it's a bit tangled. We're doing symmetric HMAC on a server-signed token, but the scope claims live on the client.", tools: [
          { tool: 'terminal', call: 'git status', dur: 0.3 },
          { tool: 'file', call: 'src/auth/session.ts', dur: 0.1 },
          { tool: 'file', call: 'src/auth/scope.ts', dur: 0.1 },
        ]
      },
      { role: 'user', text: "Let's switch to OAuth 2.1 with PKCE. Draft the changes for `session.ts`." },
      { role: 'assistant', text: "I'll look up the latest PKCE spec guidance and draft the changes. Here's a first pass:", tools: [
          { tool: 'web', call: '"oauth 2.1 pkce best practices 2026"', dur: 1.2 },
          { tool: 'file', call: 'src/auth/session.ts · edit', dur: 0.1, diff: true },
        ], diff: true
      },
    ],
  },
  {
    id: 's2',
    title: 'log triage · nginx errors',
    model: 'claude-sonnet-4',
    personality: 'terse',
    skills: [],
    live: false,
    tokens: 34_200, cost: 0.18, contextPct: 18, msgCount: 14,
    updated: NOW - 12 * MIN,
    messages: [
      { role: 'user', text: 'pull the last hour of /var/log/nginx/error.log and tell me what\'s spiking' },
      { role: 'assistant', text: 'Scanning now…', tools: [
        { tool: 'terminal', call: 'tail -n 2000 /var/log/nginx/error.log | grep -i error', dur: 0.4 },
      ]},
    ],
  },
  {
    id: 's3',
    title: 'skills hub design spike',
    model: 'claude-haiku-4-5',
    personality: 'playful',
    skills: ['excalidraw'],
    live: false,
    tokens: 7_800, cost: 0.02, contextPct: 8, msgCount: 6,
    updated: NOW - 1 * HR,
    messages: [
      { role: 'user', text: 'sketch out a 2-column skills hub — pinned on the left, browse on the right' },
      { role: 'assistant', text: 'Started a layout — here\'s v1. Drag to reorder pinned skills.' },
    ],
  },
  {
    id: 's4',
    title: 'fix issue #123 — race in uploader',
    model: 'claude-sonnet-4',
    personality: 'concise',
    skills: ['github-pr-workflow'],
    live: false, warn: true,
    tokens: 128_600, cost: 0.71, contextPct: 62, msgCount: 40,
    updated: NOW - 1 * DAY,
    messages: [
      { role: 'user', text: 'triaging #123. last repro was Tuesday. start there.' },
      { role: 'assistant', text: 'On it. Looking at PR history and the uploader module…', tools: [
        { tool: 'github', call: 'list_issues #123', dur: 0.8 },
        { tool: 'file', call: 'src/upload/queue.ts', dur: 0.2 },
      ]},
    ],
  },
  {
    id: 's5',
    title: 'llama-3 fine-tune preflight',
    model: 'claude-sonnet-4',
    personality: 'concise',
    skills: ['axolotl'],
    live: false, warn: true,
    tokens: 147_200, cost: 0.84, contextPct: 71, msgCount: 56,
    updated: NOW - 1 * DAY - 3 * HR,
    messages: [],
  },
  {
    id: 's6',
    title: 'PR #412 review — billing',
    model: 'claude-haiku-4-5',
    personality: 'concise',
    skills: ['github-pr-workflow'],
    live: false, archived: true,
    tokens: 24_800, cost: 0.04, contextPct: 12, msgCount: 22,
    updated: NOW - 2 * DAY,
    messages: [],
  },
];

const SEED_SKILLS = [
  { id: 'github-pr-workflow', name: 'github-pr-workflow', desc: 'Open, review, merge PRs end-to-end.', installed: true, pinned: true, version: '2.4.0', author: 'hermes', category: 'dev' },
  { id: 'github-auth', name: 'github-auth', desc: 'Token-scoped GitHub auth helper.', installed: true, pinned: true, version: '1.1.0', author: 'hermes', category: 'dev' },
  { id: 'axolotl', name: 'axolotl', desc: 'Fine-tune LLMs locally.', installed: true, pinned: false, version: '0.9.1', author: 'nous', category: 'ml' },
  { id: 'gif-search', name: 'gif-search', desc: 'Find & paste GIFs by vibe.', installed: true, pinned: false, version: '1.0.2', author: 'community', category: 'fun' },
  { id: 'excalidraw', name: 'excalidraw', desc: 'Sketch diagrams with prompts.', installed: true, pinned: false, version: '3.1.0', author: 'community', category: 'creative' },
  { id: 'hermes-agent-dev', name: 'hermes-agent-dev', desc: 'Self-host contributor kit.', installed: true, pinned: false, version: '0.5.0', author: 'hermes', category: 'dev' },
  { id: 'gmail-triage', name: 'gmail-triage', desc: 'Inbox zero at your command.', installed: true, pinned: false, version: '1.3.0', author: 'community', category: 'productivity' },
  { id: 'slack-postern', name: 'slack-postern', desc: 'Post, summarize, watch channels.', installed: true, pinned: false, version: '0.8.0', author: 'community', category: 'productivity' },
  // uninstalled / hub
  { id: 'k8s-ops', name: 'k8s-ops', desc: 'kubectl with a safety net.', installed: false, pinned: false, version: '1.2.0', author: 'hermes', category: 'devops' },
  { id: 'notion-scribe', name: 'notion-scribe', desc: 'Read & write Notion pages.', installed: false, pinned: false, version: '0.4.1', author: 'community', category: 'productivity' },
  { id: 'sqlite-inspector', name: 'sqlite-inspector', desc: 'Safe read-only SQL exploration.', installed: false, pinned: false, version: '1.0.0', author: 'community', category: 'dev' },
  { id: 'pdf-reader', name: 'pdf-reader', desc: 'Extract + summarize PDFs.', installed: false, pinned: false, version: '2.1.0', author: 'hermes', category: 'productivity' },
];

const SEED_BG_TASKS = [
  { id: 'bg1', title: 'analyze /var/log errors from today', progress: 72, elapsed: 134, status: 'running', model: 'haiku-4-5' },
  { id: 'bg2', title: 'summarize PR diffs in ~/proj', progress: 35, elapsed: 48, status: 'running', model: 'haiku-4-5' },
  { id: 'bg3', title: 'security scan *.py', progress: 100, elapsed: 70, status: 'done', model: 'sonnet-4' },
];

const SEED_MODELS = [
  { id: 'claude-sonnet-4',   label: 'claude-sonnet-4',   provider: 'nous portal', ctx: '200K', cost: '$3/$15' },
  { id: 'claude-haiku-4-5',  label: 'claude-haiku-4-5',  provider: 'nous portal', ctx: '200K', cost: '$0.25/$1.25' },
  { id: 'claude-opus-4-1',   label: 'claude-opus-4-1',   provider: 'nous portal', ctx: '200K', cost: '$15/$75' },
  { id: 'gpt-5',             label: 'gpt-5',             provider: 'nous portal', ctx: '256K', cost: '$5/$25' },
  { id: 'gemini-3-pro',      label: 'gemini-3-pro',      provider: 'nous portal', ctx: '1M',   cost: '$2/$10' },
  { id: 'hermes-4-70b',      label: 'hermes-4-70b',      provider: 'self-hosted', ctx: '128K', cost: 'free'   },
  { id: 'llama-3.3-70b',     label: 'llama-3.3-70b',     provider: 'self-hosted', ctx: '128K', cost: 'free'   },
];

const SEED_PERSONALITIES = [
  { id: 'concise',  label: 'concise',  desc: 'short, direct answers; no fluff.' },
  { id: 'terse',    label: 'terse',    desc: 'minimum words, maximum signal.' },
  { id: 'playful',  label: 'playful',  desc: 'casual tone, comfortable with banter.' },
  { id: 'pirate',   label: 'pirate',   desc: 'arr — full sea-dog cosplay.' },
  { id: 'socratic', label: 'socratic', desc: 'asks before answering.' },
  { id: 'literal',  label: 'literal',  desc: 'zero inference; exactly what was asked.' },
];

const SEED_SLASH = [
  { cmd: '/background',  desc: 'Run this prompt in a separate background session' },
  { cmd: '/compress',    desc: 'Summarize middle turns to reclaim context' },
  { cmd: '/model',       desc: 'Switch the current model' },
  { cmd: '/skills',      desc: 'Browse & install skills' },
  { cmd: '/voice',       desc: 'Toggle voice mode (⌃B to record)' },
  { cmd: '/resume',      desc: 'Resume a previous session' },
  { cmd: '/personality', desc: 'Change conversational style' },
  { cmd: '/clear',       desc: 'Clear current session' },
  { cmd: '/export',      desc: 'Export session as markdown' },
  { cmd: '/share',       desc: 'Create a shareable link' },
];

// ── Store ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hermes-app-v1';

const DEFAULT_STATE = {
  route: { name: 'home' },                 // { name: 'home' | 'chat' | 'skills' | 'settings' | 'sessions' | 'background', params? }
  activeSessionId: 's1',
  openTabs: ['s1', 's2'],                  // session ids open as tabs in chat view
  sessions: SEED_SESSIONS,
  skills: SEED_SKILLS,
  bgTasks: SEED_BG_TASKS,
  commandOpen: false,
  voiceOn: false,
  rightPanel: 'tools',                     // 'tools' | 'inspector' | 'hidden'
  leftPanelCollapsed: false,
  settings: {
    model: 'claude-sonnet-4',
    personality: 'concise',
    reasoning: 'high',
    fallback: 'claude-haiku-4-5',
    provider: 'nous portal',
    compressionThreshold: 50,
    compressionModel: 'claude-haiku-4-5',
    temperature: 0.7,
    dailyBudget: 5,
    dark: false,
    density: 'cozy',
    connectors: { terminal: true, web: true, files: true, github: true, slack: false, gmail: false },
  },
  toast: null,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const saved = JSON.parse(raw);
    // deep-merge on top of defaults so new fields in code don't break saved state
    return {
      ...DEFAULT_STATE,
      ...saved,
      settings: { ...DEFAULT_STATE.settings, ...(saved.settings || {}), connectors: { ...DEFAULT_STATE.settings.connectors, ...((saved.settings || {}).connectors || {}) } },
      sessions: saved.sessions && saved.sessions.length ? saved.sessions : SEED_SESSIONS,
      skills:   saved.skills && saved.skills.length ? saved.skills : SEED_SKILLS,
      bgTasks:  saved.bgTasks || SEED_BG_TASKS,
    };
  } catch { return DEFAULT_STATE; }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, commandOpen: false, toast: null })); } catch {}
}

// React context + reducer-ish hook
const StoreCtx = React.createContext(null);

function useStoreSetup() {
  const [state, setState] = React.useState(loadState);

  // persist
  React.useEffect(() => { saveState(state); }, [state]);

  // sync dark mode to body class
  React.useEffect(() => {
    document.body.classList.toggle('dark', !!state.settings.dark);
  }, [state.settings.dark]);

  const api = React.useMemo(() => ({
    state,
    set: (patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })),

    navigate: (name, params) => setState((s) => ({ ...s, route: { name, params }, commandOpen: false })),

    openCmd:   () => setState((s) => ({ ...s, commandOpen: true })),
    closeCmd:  () => setState((s) => ({ ...s, commandOpen: false })),

    toast: (msg) => {
      setState((s) => ({ ...s, toast: { msg, id: Date.now() } }));
      setTimeout(() => setState((s) => (s.toast && s.toast.msg === msg ? { ...s, toast: null } : s)), 2400);
    },

    // sessions
    openSession: (id) => setState((s) => {
      const tabs = s.openTabs.includes(id) ? s.openTabs : [...s.openTabs, id];
      return { ...s, activeSessionId: id, openTabs: tabs, route: { name: 'chat' }, commandOpen: false };
    }),
    newSession: () => setState((s) => {
      const id = 'sN' + Date.now();
      const sess = {
        id, title: 'new session', model: s.settings.model, personality: s.settings.personality,
        skills: s.skills.filter(sk => sk.pinned).map(sk => sk.id),
        live: false, tokens: 0, cost: 0, contextPct: 0, msgCount: 0,
        updated: Date.now(), messages: [],
      };
      return { ...s, sessions: [sess, ...s.sessions], activeSessionId: id, openTabs: [...s.openTabs, id], route: { name: 'chat' }, commandOpen: false };
    }),
    closeTab: (id) => setState((s) => {
      const tabs = s.openTabs.filter(t => t !== id);
      const active = s.activeSessionId === id ? (tabs[tabs.length - 1] || s.sessions[0].id) : s.activeSessionId;
      return { ...s, openTabs: tabs.length ? tabs : [s.sessions[0].id], activeSessionId: active };
    }),
    setActiveTab: (id) => setState((s) => ({ ...s, activeSessionId: id })),

    updateSession: (id, patch) => setState((s) => ({
      ...s, sessions: s.sessions.map(se => se.id === id ? { ...se, ...patch, updated: Date.now() } : se),
    })),
    sendMessage: (id, text) => setState((s) => ({
      ...s,
      sessions: s.sessions.map((se) => {
        if (se.id !== id) return se;
        const next = [...se.messages, { role: 'user', text }];
        // simulated agent response appended shortly via onSend handler in component
        return { ...se, messages: next, msgCount: se.msgCount + 1, updated: Date.now(), live: true };
      }),
    })),
    appendMessage: (id, msg) => setState((s) => ({
      ...s, sessions: s.sessions.map(se => se.id === id ? { ...se, messages: [...se.messages, msg], msgCount: se.msgCount + 1, updated: Date.now() } : se),
    })),

    // skills
    toggleSkillPinned: (id) => setState((s) => ({
      ...s, skills: s.skills.map(sk => sk.id === id ? { ...sk, pinned: !sk.pinned } : sk),
    })),
    toggleSkillInstalled: (id) => setState((s) => ({
      ...s, skills: s.skills.map(sk => sk.id === id ? { ...sk, installed: !sk.installed, pinned: sk.installed ? false : sk.pinned } : sk),
    })),

    // bg
    addBgTask: (title) => setState((s) => ({ ...s, bgTasks: [{ id: 'bgN'+Date.now(), title, progress: 0, elapsed: 0, status: 'running', model: s.settings.model }, ...s.bgTasks] })),
    updateBgTask: (id, patch) => setState((s) => ({ ...s, bgTasks: s.bgTasks.map(t => t.id === id ? { ...t, ...patch } : t) })),
    cancelBgTask: (id) => setState((s) => ({ ...s, bgTasks: s.bgTasks.map(t => t.id === id ? { ...t, status: 'cancelled' } : t) })),
    removeBgTask: (id) => setState((s) => ({ ...s, bgTasks: s.bgTasks.filter(t => t.id !== id) })),

    // settings
    setSetting: (key, val) => setState((s) => ({ ...s, settings: { ...s.settings, [key]: val } })),
    setConnector: (key, on) => setState((s) => ({ ...s, settings: { ...s.settings, connectors: { ...s.settings.connectors, [key]: on } } })),

    toggleVoice: () => setState((s) => ({ ...s, voiceOn: !s.voiceOn })),
    setRightPanel: (v) => setState((s) => ({ ...s, rightPanel: v })),
    toggleLeftPanel: () => setState((s) => ({ ...s, leftPanelCollapsed: !s.leftPanelCollapsed })),

    // helpers
    models: SEED_MODELS,
    personalities: SEED_PERSONALITIES,
    slashCommands: SEED_SLASH,
  }), [state]);

  return api;
}

function useStore() { return React.useContext(StoreCtx); }

// ── Utilities ────────────────────────────────────────────────────────

function relTime(ts) {
  const d = Date.now() - ts;
  if (d < 45 * 1000) return 'just now';
  if (d < 90 * 1000) return '1m ago';
  if (d < HR)        return Math.floor(d / MIN) + 'm ago';
  if (d < DAY)       return Math.floor(d / HR)  + 'h ago';
  if (d < 2 * DAY)   return 'yesterday';
  return Math.floor(d / DAY) + 'd ago';
}
function fmtTokens(n) { if (n >= 1000) return (n/1000).toFixed(n > 10_000 ? 0 : 1) + 'K'; return ''+n; }
function fmtSecs(s) { if (s < 60) return s + 's'; const m = Math.floor(s/60); return m + 'm ' + (s%60) + 's'; }
function fmtCost(n) { return '$' + n.toFixed(2); }

Object.assign(window, {
  StoreCtx, useStoreSetup, useStore,
  SEED_MODELS, SEED_PERSONALITIES, SEED_SLASH,
  relTime, fmtTokens, fmtSecs, fmtCost,
});
