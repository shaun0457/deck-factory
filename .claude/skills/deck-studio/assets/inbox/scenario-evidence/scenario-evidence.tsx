// Inbox snippet, not a kit module yet. Paste after the kit blocks of a deck.
// Expects in scope: abs, INK, BODY, MUTED, RULE, NEUTRAL, OK, MONO (kit:base); RIGHT_X, RIGHT_W (kit:map).

// Quality lenses: one colour each, used for incident badges and evidence chips. Define per deck.
const LENSES = {
  data: { name: '資料一致性', color: '#A8740A', tint: '#FBF3DB' },
  api: { name: 'API 行為', color: '#2F6FAE', tint: '#E7F3F8' },
  rel: { name: '可靠度', color: '#E8553B', tint: '#FAF1F5' },
} as const;
type Lens = keyof typeof LENSES;

// Square ink badge: "my design N". Never round, so it cannot be read as an incident.
const DesignBadge = ({ n, size = 36 }: { n: number; size?: number }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: 8,
      background: INK,
      color: '#FFFFFF',
      fontSize: size * 0.58,
      fontWeight: 800,
    }}
  >
    {n}
  </span>
);

// The same square badge drawn on a system map (map coordinates).
const DesignMark = ({ n, x, y }: { n: number; x: number; y: number }) => (
  <g>
    <rect x={x - 22} y={y - 22} width={44} height={44} rx={9} fill={INK} stroke="#FFFEFC" strokeWidth={3} />
    <text x={x} y={y + 10} textAnchor="middle" fontSize={28} fontWeight={800} fill="#FFFFFF">
      {n}
    </text>
  </g>
);

// Round badge coloured by lens: "incident N".
const IncidentBadge = ({ n, lens, size = 40 }: { n: number; lens: Lens; size?: number }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      background: LENSES[lens].color,
      color: '#FFFFFF',
      fontSize: size * 0.55,
      fontWeight: 800,
    }}
  >
    {n}
  </span>
);

const ScenarioHead = ({ cols, top = 300 }: { cols: [string, string, string]; top?: number }) => (
  <div
    style={{
      ...abs(RIGHT_X, top, RIGHT_W),
      display: 'flex',
      height: 44,
      alignItems: 'center',
      borderBottom: `2px solid ${INK}`,
      fontSize: 22,
      color: MUTED,
    }}
  >
    <div style={{ width: 270 }}>{cols[0]}</div>
    <div style={{ flex: 1 }}>{cols[1]}</div>
    <div style={{ width: 230, textAlign: 'right' }}>{cols[2]}</div>
  </div>
);

const ScenarioList = ({ children, top = 346 }: { children: ReactNode; top?: number }) => (
  <div style={{ ...abs(RIGHT_X, top, RIGHT_W), display: 'flex', flexDirection: 'column' }}>{children}</div>
);

// One row: situation (with a design badge) → what the system does (+ mechanism) → tests.
const Scenario = ({
  design,
  when,
  does,
  mech,
  test,
  first = false,
  compact = false,
}: {
  design?: number;
  when: ReactNode;
  does: ReactNode;
  mech?: string;
  test: string | string[];
  first?: boolean;
  compact?: boolean;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      boxSizing: 'border-box',
      padding: compact ? '14px 0' : '20px 0',
      borderTop: first ? undefined : `1.5px solid ${RULE}`,
    }}
  >
    <div style={{ width: 270, flexShrink: 0, display: 'flex', alignItems: 'flex-start', gap: 12, paddingRight: 16, boxSizing: 'border-box' }}>
      {design !== undefined ? <DesignBadge n={design} size={34} /> : null}
      <span style={{ fontSize: 28, fontWeight: 780, lineHeight: 1.3, color: INK }}>{when}</span>
    </div>
    <div style={{ flex: 1, paddingRight: 16 }}>
      <div style={{ fontSize: 26, lineHeight: 1.45, color: BODY }}>{does}</div>
      {mech ? (
        <span
          style={{
            display: 'inline-block',
            marginTop: 10,
            padding: '3px 12px',
            borderRadius: 10,
            background: NEUTRAL,
            fontFamily: MONO,
            fontSize: 19,
            color: INK,
          }}
        >
          {mech}
        </span>
      ) : null}
    </div>
    <div style={{ width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <span style={{ fontSize: 26, fontWeight: 800, color: OK }}>✓</span>
      {(Array.isArray(test) ? test : [test]).map((t, i) => (
        <span key={`${i}-${t}`} style={{ fontFamily: MONO, fontSize: Array.isArray(test) ? 19 : 21, lineHeight: 1.2, color: BODY }}>
          {t}
        </span>
      ))}
    </div>
  </div>
);

// Bottom row of a design page: which incidents it stops (chips tinted by lens) and which tests prove it.
const Evidence = ({ items, tests, top = 836 }: { items: { title: string; lens: Lens }[]; tests: string[]; top?: number }) => (
  <div style={{ ...abs(RIGHT_X, top, RIGHT_W), boxSizing: 'border-box', borderTop: `2px solid ${INK}`, paddingTop: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 12, rowGap: 8 }}>
      <span style={{ marginRight: 4, fontSize: 21, fontWeight: 780, letterSpacing: '0.04em', color: MUTED }}>擋住</span>
      {items.map((it, i) => (
        <span
          key={`${i}-${it.title}`}
          title={LENSES[it.lens].name}
          style={{
            padding: '4px 14px',
            borderRadius: 10,
            borderLeft: `6px solid ${LENSES[it.lens].color}`,
            background: LENSES[it.lens].tint,
            fontSize: 23,
            fontWeight: 760,
            color: INK,
          }}
        >
          {it.title}
        </span>
      ))}
    </div>
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 12 }}>
      <span style={{ flexShrink: 0, fontSize: 21, fontWeight: 780, letterSpacing: '0.04em', color: MUTED }}>測試</span>
      <span style={{ display: 'flex', flexWrap: 'wrap', columnGap: 14, fontFamily: MONO, fontSize: 20, color: INK }}>
        {tests.map((t, i) => (
          <span key={`${i}-${t}`} style={{ whiteSpace: 'nowrap' }}>
            {i > 0 ? '· ' : ''}
            {t}
          </span>
        ))}
      </span>
    </div>
  </div>
);
