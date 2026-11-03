// Cards and rows. Sizes assume the 1920×1080 grid in kit:base and the zoom
// layout in kit:map (MINI_W, RIGHT_X, RIGHT_W).

// Small pill after a label, e.g. Build / Reuse.
const Tag = ({ label, good = false }: { label: string; good?: boolean }) => (
  <span
    style={{
      marginLeft: 14,
      padding: '2px 12px',
      borderRadius: 10,
      fontSize: 20,
      fontWeight: 760,
      color: good ? OK : CORAL,
      background: good ? TINT_GREEN : TINT_PINK,
      verticalAlign: 'middle',
    }}
  >
    {label}
  </span>
);

// Card under the mini map on zoom pages.
const SideCard = ({ label, children }: { label: ReactNode; children: ReactNode }) => (
  <div
    style={{
      ...abs(GUTTER, 660, MINI_W, 270),
      boxSizing: 'border-box',
      borderRadius: 'var(--osd-radius)',
      background: NEUTRAL,
      padding: '26px 36px',
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 780, letterSpacing: '0.06em', color: CORAL }}>{label}</div>
    <div style={{ marginTop: 14 }}>{children}</div>
  </div>
);

// Choice / rejected / cost. Keep each value to ~20 CJK characters per line.
const TradeCard = ({ choose, reject, cost, tag }: { choose: string; reject: string; cost: string; tag?: ReactNode }) => {
  const label: CSSProperties = { fontSize: 22, fontWeight: 760, color: MUTED };
  return (
    <SideCard
      label={
        <>
          取捨
          {tag}
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', rowGap: 10, alignItems: 'baseline', fontSize: 27, lineHeight: 1.4 }}>
        <span style={label}>選擇</span>
        <span style={{ fontWeight: 760, color: INK }}>{choose}</span>
        <span style={label}>沒選</span>
        <span style={{ color: MUTED }}>{reject}</span>
        <span style={label}>代價</span>
        <span style={{ color: BODY }}>{cost}</span>
      </div>
    </SideCard>
  );
};

// Muted heading for a block in the right column of a zoom page.
const SectionLabel = ({ top, left = RIGHT_X, width = RIGHT_W, children }: { top: number; left?: number; width?: number; children: ReactNode }) => (
  <div style={{ ...abs(left, top, width), fontSize: 24, fontWeight: 780, letterSpacing: '0.04em', color: MUTED }}>{children}</div>
);

// Numbered or lettered lines, e.g. the flow legend next to the overview map.
const MarkList = ({ items, mark = 'number', size = 28 }: { items: [string, ReactNode][]; mark?: 'number' | 'letter'; size?: number }) => (
  <div>
    {items.map(([m, text], i) => (
      <div
        key={`${i}-${m}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: mark === 'letter' ? 18 : 16,
          marginTop: mark === 'letter' ? 18 : 16,
          fontSize: size,
          fontWeight: mark === 'letter' ? 760 : 400,
          color: INK,
        }}
      >
        <Dot size={mark === 'letter' ? 44 : 34} fill={mark === 'letter' ? INK : CORAL}>
          {m}
        </Dot>
        {text}
      </div>
    ))}
  </div>
);

// Requirement / deliverable status. state: done, extra (bonus done), missing.
const StatusChip = ({ kicker, name, state }: { kicker: string; name: string; state: 'done' | 'extra' | 'missing' }) => (
  <div
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      height: 118,
      borderRadius: 20,
      background: state === 'missing' ? TINT_PINK : state === 'extra' ? TINT_YELLOW : TINT_GREEN,
      padding: '18px 24px',
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 650, color: MUTED }}>{kicker}</div>
    <div style={{ marginTop: 6, fontSize: 30, fontWeight: 760, color: INK }}>{name}</div>
    <div style={{ position: 'absolute', right: 22, top: 16, fontSize: 34, fontWeight: 800, color: state === 'missing' ? CORAL : OK }}>
      {state === 'missing' ? '✗' : state === 'extra' ? '★' : '✓'}
    </div>
  </div>
);

// Horizontal bar with a label, grows in when the page becomes active.
// `bar` is the bar width in px; scale your values to the 1180 px track yourself.
const BarRow = ({
  y,
  label,
  bar,
  color,
  value,
  inside,
  live,
  delay,
}: {
  y: number;
  label: string;
  bar: number;
  color: string;
  value?: string;
  inside?: string;
  live: boolean;
  delay: number;
}) => (
  <>
    <div style={{ ...abs(GUTTER, y, 250, 48), display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 700 }}>{label}</div>
    <div
      style={{
        ...abs(390, y + 10, bar, 28),
        background: color,
        borderRadius: 14,
        transformOrigin: 'left',
        animation: live ? `fw-grow 0.8s ${EASE_OUT} ${delay}s both` : undefined,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: inside ? 18 : 0,
        boxSizing: 'border-box',
        fontSize: 24,
        fontWeight: 700,
        color: '#FFFFFF',
        whiteSpace: 'nowrap',
      }}
    >
      {inside}
    </div>
    {value ? (
      <div style={{ ...abs(390 + bar + 20, y, 600, 48), display: 'flex', alignItems: 'center', fontSize: 28, color: BODY }}>{value}</div>
    ) : null}
  </>
);

// Tinted card with a title and 2–3 short lines (use <br /> for CJK line breaks).
const PhaseCard = ({ title, tint, width = 436, height = 230, children }: { title: string; tint: string; width?: number; height?: number; children: ReactNode }) => (
  <TintCard tint={tint} style={{ width, height, padding: '28px 36px' }}>
    <CardTitle size={32}>{title}</CardTitle>
    <CardBody style={{ marginTop: 12, fontSize: 26 }}>{children}</CardBody>
  </TintCard>
);

// One-line tinted row: name on the left, description on the right.
const RowCard = ({ name, desc, tint, height = 96 }: { name: string; desc: ReactNode; tint: string; height?: number }) => (
  <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', height, borderRadius: 18, padding: '0 30px', background: tint }}>
    <div style={{ width: 200, flexShrink: 0, fontSize: 30, fontWeight: 760, color: INK }}>{name}</div>
    <div style={{ fontSize: 26, lineHeight: 1.4, color: BODY }}>{desc}</div>
  </div>
);

// Scenario: what happens (left) → how the system handles it (right) + mechanism in mono.
const ScenarioRow = ({ n, when, guard, mech, tint, height = 200 }: { n: string; when: ReactNode; guard: ReactNode; mech: string; tint: string; height?: number }) => (
  <div style={{ boxSizing: 'border-box', display: 'flex', gap: 28, height, borderRadius: 20, padding: '26px 32px', background: tint }}>
    <div style={{ width: 230, flexShrink: 0 }}>
      <div style={{ fontSize: 22, fontWeight: 650, color: MUTED }}>情境 {n}</div>
      <div style={{ marginTop: 6, fontSize: 32, fontWeight: 780, lineHeight: 1.3, color: INK }}>{when}</div>
    </div>
    <div>
      <div style={{ fontSize: 26, lineHeight: 1.5, color: BODY }}>{guard}</div>
      <div style={{ marginTop: 10 }}>
        <Code size={22}>{mech}</Code>
      </div>
    </div>
  </div>
);

// Table header + rows: rule / how it is checked / test name.
const RuleHeader = ({ cols }: { cols: [string, string, string] }) => (
  <div style={{ display: 'flex', height: 44, alignItems: 'center', borderBottom: `2px solid ${INK}`, fontSize: 22, color: MUTED }}>
    <div style={{ width: 300 }}>{cols[0]}</div>
    <div style={{ flex: 1 }}>{cols[1]}</div>
    <div>{cols[2]}</div>
  </div>
);

const RuleLine = ({ rule, how, test, first = false }: { rule: string; how: string; test: string; first?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', height: 72, borderTop: first ? undefined : `1.5px solid ${RULE}` }}>
    <div style={{ width: 300, flexShrink: 0, fontSize: 26, fontWeight: 760, color: INK }}>{rule}</div>
    <div style={{ flex: 1, fontSize: 24, color: BODY }}>{how}</div>
    <div style={{ fontFamily: MONO, fontSize: 19, color: MUTED }}>{test}</div>
  </div>
);

// Titled group with an inline subtitle, e.g. known limits / unverified / next.
const GroupRow = ({ title, sub, height, tint, children }: { title: string; sub: string; height: number; tint: string; children: ReactNode }) => (
  <div style={{ boxSizing: 'border-box', height, borderRadius: 20, padding: '22px 32px', background: tint }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <span style={{ fontSize: 30, fontWeight: 780, color: INK }}>{title}</span>
      <span style={{ fontSize: 22, color: MUTED }}>{sub}</span>
    </div>
    <div style={{ marginTop: 10, fontSize: 26, lineHeight: 1.5, color: BODY }}>{children}</div>
  </div>
);

// Integration status row; dashed = not verified / not built.
const StatusRow = ({ name, where, status, dashed = false }: { name: string; where: string; status: string; dashed?: boolean }) => (
  <div
    style={{
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      height: 80,
      borderRadius: 18,
      padding: '0 30px',
      background: dashed ? 'transparent' : NEUTRAL,
      border: dashed ? `2.5px dashed ${MUTED}` : undefined,
    }}
  >
    <div style={{ width: 210, fontSize: 32, fontWeight: 760, color: dashed ? BODY : INK }}>{name}</div>
    <div style={{ flex: 1, fontSize: 26, color: BODY }}>{where}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: dashed ? MUTED : OK }}>{status}</div>
  </div>
);

// Numbered step chip; lay several out in a 2-column grid.
const NumberChip = ({ n, tint = TINT_PINK, children }: { n: string; tint?: string; children: ReactNode }) => (
  <div
    style={{
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      height: 86,
      borderRadius: 18,
      padding: '0 24px',
      background: tint,
      fontSize: 25,
      lineHeight: 1.35,
      color: INK,
    }}
  >
    <Dot size={32}>{n}</Dot>
    <span>{children}</span>
  </div>
);
