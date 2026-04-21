// Shared wireframe primitives: sketchy glyphs, arrows, callouts, bars.
// Pure presentational, no state.

const Glyph = ({ d, size = 16, style }) => (
  <svg className="glyph" viewBox="0 0 16 16" width={size} height={size} style={style}>
    <path d={d} />
  </svg>
);

// A handful of sketchy glyphs
const G = {
  chat:    "M2 4c0-1 1-2 2-2h8c1 0 2 1 2 2v5c0 1-1 2-2 2H7l-3 3v-3h-0c-1 0-2-1-2-2Z",
  plus:    "M8 3v10 M3 8h10",
  search:  "M7 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z M11 11l3 3",
  cog:     "M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z M8 1v2 M8 13v2 M1 8h2 M13 8h2 M3 3l1.4 1.4 M11.6 11.6 13 13 M3 13l1.4-1.4 M11.6 4.4 13 3",
  folder:  "M2 4h4l1 1.5h7V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z",
  play:    "M4 3l9 5-9 5Z",
  stop:    "M4 4h8v8H4z",
  send:    "M2 8 14 2 11 14 8 9 Z",
  mic:     "M8 2a2 2 0 0 0-2 2v4a2 2 0 0 0 4 0V4a2 2 0 0 0-2-2Z M3 8a5 5 0 0 0 10 0 M8 13v2",
  tool:    "M3 13l4-4 M10 3l3 3-4 4-3-3Z M3 13l1 0 0-1",
  user:    "M8 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z M3 14a5 5 0 0 1 10 0",
  robot:   "M4 6h8v7H4Z M8 3v3 M6 9.5h.01 M10 9.5h.01 M2 9h2 M12 9h2",
  skill:   "M8 2l2 4 4 .5-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3L6 6Z",
  clock:   "M8 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z M8 5v3l2 2",
  bolt:    "M9 2 3 9h4l-1 5 6-7H8Z",
  branch:  "M4 2v12 M4 7a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3",
  close:   "M3 3l10 10 M13 3 3 13",
  check:   "M3 8l3 3 7-7",
  menu:    "M2 4h12 M2 8h12 M2 12h12",
  slash:   "M4 13 12 3",
  dots:    "M4 8h.01 M8 8h.01 M12 8h.01",
  chev:    "M5 4l4 4-4 4",
  arrowR:  "M2 8h12 M10 4l4 4-4 4",
  eye:     "M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  trash:   "M3 5h10 M5 5V3h6v2 M5 5l.7 8a1 1 0 0 0 1 1h2.6a1 1 0 0 0 1-1L11 5",
  plug:    "M6 2v3 M10 2v3 M4 5h8v3a4 4 0 0 1-8 0Z M8 12v3",
  stack:   "M8 2 2 5l6 3 6-3Z M2 8l6 3 6-3 M2 11l6 3 6-3",
  dollar:  "M8 2v12 M11 5a3 3 0 0 0-3-1.5c-1.7 0-3 1-3 2.2 0 3 6 1.8 6 4.6 0 1.3-1.3 2.2-3 2.2A3 3 0 0 1 5 11",
  globe:   "M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2Z M2 8h12 M8 2c2 2 2 10 0 12 M8 2c-2 2-2 10 0 12",
  terminal:"M3 4l3 4-3 4 M7 12h6",
  voice:   "M3 6v4 M6 4v8 M9 5v6 M12 3v10",
  fork:    "M4 3v4a3 3 0 0 0 3 3h2a3 3 0 0 1 3 3v0 M4 3v0 M12 13v0",
  pin:     "M8 2v5 M5 7h6l-1 3H6Z M8 10v4",
};

const Ic = ({ k, size, style }) => <Glyph d={G[k] || ''} size={size} style={style} />;

// Handwritten arrow — curved, ends at (tx,ty), starts at (sx,sy)
const WArrow = ({ sx, sy, tx, ty, curve = 40, flip = false, strokeWidth = 1.6, color }) => {
  const mx = (sx + tx) / 2 + (flip ? -curve : curve);
  const my = (sy + ty) / 2 - curve / 2;
  // arrowhead
  const dx = tx - mx, dy = ty - my;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const lx = tx - ux * 10 + -uy * 5;
  const ly = ty - uy * 10 +  ux * 5;
  const rx = tx - ux * 10 +  uy * 5;
  const ry = ty - uy * 10 + -ux * 5;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
      <path className="arrow" d={`M${sx} ${sy} Q${mx} ${my} ${tx} ${ty}`} style={color && { stroke: color }} strokeWidth={strokeWidth} />
      <path className="arrow" d={`M${lx} ${ly} L${tx} ${ty} L${rx} ${ry}`} style={color && { stroke: color }} strokeWidth={strokeWidth} />
    </svg>
  );
};

// Callout: Caveat text at absolute (x,y) with optional arrow target (ax,ay).
const Callout = ({ x, y, w = 180, text, ax, ay, curve = 30, flip, align = 'left' }) => (
  <>
    <div className="note" style={{ position: 'absolute', left: x, top: y, width: w, textAlign: align }}>
      {text}
    </div>
    {ax != null && (
      <WArrow sx={x + (flip ? w - 10 : 10)} sy={y + 24} tx={ax} ty={ay} curve={curve} flip={flip} />
    )}
  </>
);

// Text bar placeholder row
const Bars = ({ lines = 3, widths = ['85%', '65%', '40%'], gap = 6, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="bar" style={{ width: widths[i % widths.length] }} />
    ))}
  </div>
);

// Fake avatar
const Avatar = ({ letter = 'H', style }) => <span className="avatar" style={style}>{letter}</span>;

// Image/chart placeholder box
const PlaceHatch = ({ w, h, label, style }) => (
  <div className="box-soft hatch-soft" style={{ width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, ...style }}>
    {label}
  </div>
);

Object.assign(window, { Glyph, G, Ic, WArrow, Callout, Bars, Avatar, PlaceHatch });
