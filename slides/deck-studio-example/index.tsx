// ==== deck-studio:kit header start ====
import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  type SlideTransition,
  Step,
  Steps,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import { type CSSProperties, type ReactNode, useId } from 'react';

// Built with the deck-studio kit (deck-factory repo, .claude/skills/deck-studio). Blocks between
// "deck-studio:kit" markers are owned by the kit: edit them in the skill and run
// `node scripts/new-deck.mjs --sync` instead of editing them here.
// ==== deck-studio:kit header end ====

// ==== deck-studio:kit base start ====
// Theme (Fieldwork, adapted for Traditional Chinese), page frame, title row,
// chapter progress bar, footer and small text pieces.
// Needs from the deck section: `const DECK = { name, byline, chapters }`.

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,400..800&family=Noto+Sans+TC:wght@400..800&family=JetBrains+Mono:wght@500&display=swap';
const FONT_LINK_ID = 'osd-webfont-deck-studio';
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
}

const STYLE_ID = 'osd-styles-deck-studio';
const KEYFRAMES = `@keyframes fw-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }`;
if (typeof document !== 'undefined') {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== KEYFRAMES) style.textContent = KEYFRAMES;
}

export const design: DesignSystem = {
  palette: { bg: '#FFFEFC', text: '#191919', accent: '#E8553B' },
  fonts: {
    display: '"Inter", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif',
    body: '"Inter", "Noto Sans TC", "Microsoft JhengHei", "PingFang TC", sans-serif',
  },
  typeScale: { hero: 124, body: 32 },
  radius: 24,
};

const INK = '#191919';
const CORAL = '#E8553B';
const BODY = '#5F5E5B';
const MUTED = '#9B9A97';
const RULE = 'rgba(25,25,25,0.12)';
const YELLOW = '#F8DA7E';
const BLUE = '#8DBDEB';
const PINK = '#F6C3CF';
const NEUTRAL = '#F1EFEA';
const TINT_YELLOW = '#FBF3DB';
const TINT_BLUE = '#E7F3F8';
const TINT_PINK = '#FAF1F5';
const TINT_GREEN = '#EDF3EC';
const OK = '#448361';
const NOTE_BLUE = '#4F8FCB';
const MONO = '"JetBrains Mono", Consolas, monospace';
const EASE_OUT = 'cubic-bezier(0, 0, 0.2, 1)';

// Layout grid on the 1920×1080 canvas.
const GUTTER = 120; // left and right margin
const CONTENT_W = 1680; // 1920 - 2 × GUTTER
const BODY_TOP = 300; // first row under the title
const SOWHAT_TOP = 880; // one-line takeaway
const MAIN_TITLE = 60; // conclusion titles on main pages; backups use the default 76

const abs = (left: number, top: number, width?: number, height?: number): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  width,
  height,
});

const root: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  fontVariantNumeric: 'tabular-nums',
  WebkitFontSmoothing: 'antialiased',
  overflow: 'hidden',
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    style={{
      margin: 0,
      fontFamily: 'var(--osd-font-display)',
      fontSize: 'var(--osd-size-hero)',
      fontWeight: 800,
      lineHeight: 1.22, // CJK glyphs at 124px need about 1.21 em; tighter lines spill past the box
      letterSpacing: '-0.02em',
      color: INK,
    }}
  >
    {children}
  </h1>
);

const Heading = ({ children, size = 76 }: { children: ReactNode; size?: number }) => (
  <h2
    style={{
      margin: 0,
      fontFamily: 'var(--osd-font-display)',
      fontSize: size,
      fontWeight: 800,
      lineHeight: 1.15,
      letterSpacing: '-0.015em',
      color: INK,
    }}
  >
    {children}
  </h2>
);

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 26, fontWeight: 650, color: 'var(--osd-accent)' }}>{children}</div>
);

const TintCard = ({ tint = TINT_BLUE, style, children }: { tint?: string; style?: CSSProperties; children: ReactNode }) => (
  <div
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: 'var(--osd-radius)',
      background: tint,
      padding: '34px 44px 32px',
      ...style,
    }}
  >
    {children}
  </div>
);

const Mark = ({ size = 24 }: { size?: number }) => (
  <svg aria-hidden="true" width={size * 0.8} height={size} viewBox="0 0 20 25" style={{ display: 'block' }}>
    <path d="M10 24C8.5 20 1.5 15 1.5 9.5a8.5 8.5 0 0 1 17 0C18.5 15 11.5 20 10 24Z" fill={INK} />
    <circle cx="10" cy="9.5" r="3.4" fill="#FFFEFC" />
  </svg>
);

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return (
    <div
      style={{
        ...abs(GUTTER, 1000, CONTENT_W, 32),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 22,
        color: MUTED,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Mark size={24} />
        <span style={{ color: INK, fontWeight: 720, letterSpacing: '-0.02em' }}>{DECK.name}</span>
        <span style={{ marginLeft: 12 }}>{DECK.byline}</span>
      </span>
      <span>
        {pad2(current)} / {pad2(total)}
      </span>
    </div>
  );
};

// Chapter bar across the top. Main pages: past chapters ink, current coral.
// Backup pages: only their chapter lights up, in pink.
const Progress = ({ at, backup = false }: { at: number; backup?: boolean }) => {
  if (!Number.isInteger(at) || at < 0 || at >= DECK.chapters.length) {
    console.warn(`Progress: at=${at} is outside DECK.chapters (0..${DECK.chapters.length - 1})`);
  }
  return (
  <div style={{ ...abs(GUTTER, 40, CONTENT_W), display: 'flex', gap: 10 }}>
    {DECK.chapters.map((label, i) => {
      const now = i === at;
      const done = !backup && i < at;
      return (
        <div key={`${i}-${label}`} style={{ flex: 1 }}>
          <div style={{ height: 6, borderRadius: 3, background: now ? (backup ? PINK : CORAL) : done ? INK : RULE }} />
          <div
            style={{
              marginTop: 10,
              fontSize: 20,
              fontWeight: now ? 760 : 600,
              color: now ? INK : MUTED,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        </div>
      );
    })}
  </div>
  );
};

// Eyebrow + title. Pass `at` to show the progress bar (chapter index in DECK.chapters).
const PageHead = ({
  eyebrow,
  size,
  at,
  backup = false,
  children,
}: {
  eyebrow: ReactNode;
  size?: number;
  at?: number;
  backup?: boolean;
  children: ReactNode;
}) => (
  <>
    {at === undefined ? null : <Progress at={at} backup={backup} />}
    <div style={abs(GUTTER, 116)}>
      <Eyebrow>{eyebrow}</Eyebrow>
    </div>
    <div style={abs(GUTTER, 160, CONTENT_W)}>
      <Heading size={size}>{children}</Heading>
    </div>
  </>
);

// The one sentence the page must leave behind.
const SoWhat = ({ label = 'SO WHAT', children }: { label?: string; children: ReactNode }) => (
  <div style={{ ...abs(GUTTER, SOWHAT_TOP, CONTENT_W), display: 'flex', alignItems: 'baseline', gap: 24 }}>
    <span style={{ flexShrink: 0, fontSize: 24, fontWeight: 780, letterSpacing: '0.06em', color: CORAL }}>{label}</span>
    <span style={{ fontSize: 34, fontWeight: 720, lineHeight: 1.4, color: INK }}>{children}</span>
  </div>
);

const CardTitle = ({ children, size = 44 }: { children: ReactNode; size?: number }) => (
  <div style={{ fontSize: size, fontWeight: 780, lineHeight: 1.2, letterSpacing: '-0.01em', color: INK }}>{children}</div>
);

const CardBody = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <p style={{ margin: '16px 0 0', fontSize: 30, lineHeight: 1.5, color: BODY, ...style }}>{children}</p>
);

const Code = ({ children, size = 24 }: { children: ReactNode; size?: number }) => (
  <span style={{ fontFamily: MONO, fontSize: size, color: INK }}>{children}</span>
);

// Filled circle with a number or letter.
const Dot = ({ children, size = 34, fill = CORAL }: { children: ReactNode; size?: number; fill?: string }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      background: fill,
      color: '#FFFFFF',
      fontSize: size * 0.58,
      fontWeight: 800,
    }}
  >
    {children}
  </span>
);

const ListBlock = ({ items, size = 28 }: { items: ReactNode[]; size?: number }) => (
  <ul style={{ margin: '18px 0 0', paddingLeft: 30, fontSize: size, lineHeight: 1.5, color: BODY }}>
    {items.map((item, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static list
      <li key={i} style={{ marginTop: 10 }}>
        {item}
      </li>
    ))}
  </ul>
);

export const transition: SlideTransition = {
  duration: 240,
  exit: {
    duration: 240,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [{ opacity: 1 }, { opacity: 1 }],
  },
  enter: {
    duration: 240,
    easing: EASE_OUT,
    keyframes: [
      { opacity: 0, transform: 'translateY(5px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};
// ==== deck-studio:kit base end ====

// ==== deck-studio:kit map start ====
// System map: one drawing reused on every page. The overview page shows it in
// full detail; zoom pages show a mini copy with the part under discussion
// highlighted. Overlays (letters, stickers, boundaries, ghosts) are SVG children
// drawn in map coordinates. Design the map on a ~1000-unit-wide grid.

type MapNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  fill: string;
  dashed?: boolean; // optional or not-yet-built parts
};

// A container drawn around member nodes, e.g. "API service · one process".
type MapFrame = { x: number; y: number; w: number; h: number; label: string; detailLabel?: string; members: string[] };

// `d` is an SVG path; a/b are the node ids it connects (it dims unless both are in focus).
type MapEdge = { d: string; a: string; b: string; dashed?: boolean };

// Numbered step badge placed next to an edge.
type MapHop = { n: string; x: number; y: number; a: string; b: string };

type MapSpec = {
  view: [number, number, number, number]; // SVG viewBox: x, y, width, height
  nodes: MapNode[];
  frames?: MapFrame[];
  edges: MapEdge[];
  hops?: MapHop[];
};

const MAP_DIM = 0.25;

// A typo in an id only dims the wrong thing, so say it in the console.
const warnedMap = new Set<string>();
function warnUnknownIds(spec: MapSpec, focus: string[] | 'all') {
  const ids = new Set(spec.nodes.map((n) => n.id));
  const refs: [string, string][] = [
    ...(focus === 'all' ? [] : focus.map((id): [string, string] => ['focus', id])),
    ...(spec.frames ?? []).flatMap((f) => f.members.map((id): [string, string] => [`frame "${f.label}"`, id])),
    ...spec.edges.flatMap((e, i) => [e.a, e.b].map((id): [string, string] => [`edge ${i}`, id])),
    ...(spec.hops ?? []).flatMap((h) => [h.a, h.b].map((id): [string, string] => [`hop ${h.n}`, id])),
  ];
  for (const [where, id] of refs) {
    const msg = `SystemMap: ${where} refers to unknown node id "${id}"`;
    if (!ids.has(id) && !warnedMap.has(msg)) {
      warnedMap.add(msg);
      console.warn(msg);
    }
  }
}

const SystemMap = ({
  spec,
  width,
  focus = 'all',
  detail = false,
  hops = true,
  label,
  children,
}: {
  spec: MapSpec;
  width: number;
  focus?: string[] | 'all';
  detail?: boolean;
  hops?: boolean;
  label?: string; // set when the map carries meaning the page text does not repeat
  children?: ReactNode;
}) => {
  const head = `map${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  warnUnknownIds(spec, focus);
  const on = (id: string) => focus === 'all' || focus.includes(id);
  const ring = (id: string) => focus !== 'all' && focus.includes(id);
  const [vx, vy, vw, vh] = spec.view;
  return (
    <svg
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      width={width}
      height={(width * vh) / vw}
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <marker id={head} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
      </defs>
      {(spec.frames ?? []).map((f, i) => (
        <g key={`${i}-${f.label}`} opacity={f.members.some(on) ? 1 : MAP_DIM}>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx={22} fill="none" stroke={INK} strokeWidth={3} />
          <text x={f.x + 23} y={f.y + 40} fontSize={22} fontWeight={700} fill={MUTED}>
            {detail && f.detailLabel ? f.detailLabel : f.label}
          </text>
        </g>
      ))}
      {spec.edges.map((e, i) => (
        <path
          key={`${i}-${e.a}-${e.b}`}
          d={e.d}
          fill="none"
          stroke={INK}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={e.dashed ? '8 8' : undefined}
          markerEnd={`url(#${head})`}
          opacity={on(e.a) && on(e.b) ? 1 : MAP_DIM}
        />
      ))}
      {spec.nodes.map((n) => (
        <g key={n.id} opacity={on(n.id) ? 1 : MAP_DIM}>
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={16}
            fill={n.fill}
            stroke={ring(n.id) ? CORAL : n.dashed ? INK : 'none'}
            strokeWidth={ring(n.id) ? 5 : 2.5}
            strokeDasharray={n.dashed ? '8 7' : undefined}
          />
          {detail ? (
            <>
              <text x={n.x + 20} y={n.y + 50} fontSize={30} fontWeight={760} fill={INK}>
                {n.title}
              </text>
              {n.sub ? (
                <text x={n.x + 20} y={n.y + 88} fontSize={21} fill={BODY}>
                  {n.sub}
                </text>
              ) : null}
            </>
          ) : (
            <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 12} textAnchor="middle" fontSize={34} fontWeight={760} fill={INK}>
              {n.title}
            </text>
          )}
        </g>
      ))}
      {hops
        ? (spec.hops ?? []).map((h, i) => (
            <g key={`${i}-${h.n}`} opacity={on(h.a) && on(h.b) ? 1 : MAP_DIM}>
              <circle cx={h.x} cy={h.y} r={15} fill={CORAL} />
              <text x={h.x} y={h.y + 7} textAnchor="middle" fontSize={20} fontWeight={800} fill="#FFFFFF">
                {h.n}
              </text>
            </g>
          ))
        : null}
      {children}
    </svg>
  );
};

// ---- Overlays, in map coordinates ----

// Dark circle with a letter: marks a design hotspot (A, B, C) that a later page zooms into.
const MapLetter = ({ x, y, c }: { x: number; y: number; c: string }) => (
  <g>
    <circle cx={x} cy={y} r={26} fill={INK} />
    <text x={x} y={y + 10} textAnchor="middle" fontSize={28} fontWeight={800} fill="#FFFFFF">
      {c}
    </text>
  </g>
);

// Pill label. Font 30 keeps it ~21 px when the map is drawn at mini size.
const MapSticker = ({ x, y, w, label, fill = CORAL }: { x: number; y: number; w: number; label: string; fill?: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={52} rx={26} fill={fill} />
    <text x={x + w / 2} y={y + 36} textAnchor="middle" fontSize={30} fontWeight={760} fill="#FFFFFF">
      {label}
    </text>
  </g>
);

// Dashed outline around a group, e.g. "what every PR tests".
const MapBoundary = ({ x, y, w, h, color = CORAL }: { x: number; y: number; w: number; h: number; color?: string }) => (
  <rect x={x} y={y} width={w} height={h} rx={28} fill="none" stroke={color} strokeWidth={4} strokeDasharray="12 10" />
);

// Something that does not exist yet (next steps, missing pieces).
const MapGhost = ({ x, y, w, h, title }: { x: number; y: number; w: number; h: number; title: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={16} fill="#FFFFFF" stroke={CORAL} strokeWidth={3.5} strokeDasharray="10 8" />
    <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize={32} fontWeight={760} fill={CORAL}>
      {title}
    </text>
  </g>
);

const MapLink = ({ d }: { d: string }) => (
  <path d={d} fill="none" stroke={CORAL} strokeWidth={3.5} strokeDasharray="10 8" />
);

// ---- Zoom-page layout: mini map top-left, a card under it, content on the right ----

const MINI_W = 720;
const RIGHT_X = 900;
const RIGHT_W = 900;

const MiniMap = ({
  spec,
  focus,
  hops = false,
  label,
  children,
}: {
  spec: MapSpec;
  focus?: string[] | 'all';
  hops?: boolean;
  label?: string;
  children?: ReactNode;
}) => (
  <div style={abs(GUTTER, BODY_TOP)}>
    <SystemMap spec={spec} width={MINI_W} focus={focus} hops={hops} label={label}>
      {children}
    </SystemMap>
  </div>
);
// ==== deck-studio:kit map end ====

// ==== deck-studio:kit cards start ====
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
// ==== deck-studio:kit cards end ====

// ---------- Deck: content for this talk ----------
// Example deck: a fictional "report export" service. Every number below is a
// placeholder marked 範例; replace the content, keep the page patterns.

const DECK = {
  name: '範例 deck',
  byline: '設計說明 · 講者姓名',
  chapters: ['現況', '系統全貌', 'A 受理與產生', 'B 資料庫規則', 'C 儲存接口', '怎麼證明', '限制與下一步'],
};

// One map for the whole talk. Coordinates are map units (viewBox), not pixels.
const MAP: MapSpec = {
  view: [-10, 80, 1020, 460],
  frames: [{ x: 205, y: 100, w: 470, h: 260, label: 'API 服務', detailLabel: 'API 服務 · 一個 process', members: ['accept', 'build'] }],
  nodes: [
    { id: 'user', x: 0, y: 190, w: 150, h: 120, title: '使用者', sub: '網頁 / App', fill: NEUTRAL },
    { id: 'accept', x: 230, y: 160, w: 190, h: 120, title: '受理', sub: '短交易', fill: TINT_BLUE },
    { id: 'build', x: 460, y: 160, w: 190, h: 120, title: '背景產生', sub: '不持有鎖', fill: TINT_GREEN },
    { id: 'db', x: 205, y: 420, w: 470, h: 110, title: 'PostgreSQL', sub: '工作與狀態', fill: TINT_YELLOW },
    { id: 'cloud', x: 760, y: 100, w: 240, h: 120, title: '物件儲存', sub: '雲端 · 需憑證', fill: TINT_PINK },
    { id: 'disk', x: 760, y: 240, w: 240, h: 120, title: '本機磁碟', sub: '地端 · 選用', fill: '#FFFFFF', dashed: true },
  ],
  edges: [
    { d: 'M150 230H198', a: 'user', b: 'accept' },
    { d: 'M203 270H156', a: 'user', b: 'accept' },
    { d: 'M420 220H454', a: 'accept', b: 'build' },
    { d: 'M325 280V414', a: 'accept', b: 'db' },
    { d: 'M555 280V414', a: 'build', b: 'db' },
    { d: 'M650 220H715V160H754', a: 'build', b: 'cloud' },
    { d: 'M715 220V300H754', a: 'build', b: 'disk', dashed: true },
  ],
  hops: [
    { n: '1', x: 175, y: 204, a: 'user', b: 'accept' },
    { n: '4', x: 175, y: 296, a: 'user', b: 'accept' },
    { n: '2', x: 325, y: 388, a: 'accept', b: 'db' },
    { n: '3', x: 683, y: 220, a: 'build', b: 'cloud' },
    { n: '4', x: 555, y: 388, a: 'build', b: 'db' },
  ],
};

const Cover: Page = () => (
  <div style={root}>
    <div style={{ ...abs(GUTTER, 100), display: 'flex', alignItems: 'center', gap: 14 }}>
      <Mark size={32} />
      <span style={{ fontSize: 30, fontWeight: 760, letterSpacing: '-0.02em' }}>範例 deck · deck-studio</span>
    </div>
    <div style={abs(GUTTER, 290, 1100)}>
      <Title>
        {DECK.name}
        <br />
        設計說明
      </Title>
    </div>
    <p style={{ ...abs(GUTTER, 630, 1060), margin: 0, fontSize: 38, lineHeight: 1.5, color: BODY }}>
      一句話主線：把又慢、可能失敗的工作，
      <br />
      變成狀態明確、可重送、能處理中斷的服務
    </p>
    <div style={{ ...abs(GUTTER, 880), fontSize: 26, color: MUTED }}>講者姓名 · 日期 · repo 或聯絡方式</div>
  </div>
);

const Status: Page = () => {
  const live = useIsActivePage();
  return (
    <div style={root}>
      <PageHead eyebrow="現況" size={MAIN_TITLE} at={0}>
        功能都完成；難點在檔案產生的那段時間
      </PageHead>
      <div style={{ ...abs(GUTTER, 290, CONTENT_W), display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <StatusChip kicker="需求 1" name="建立匯出工作" state="done" />
        <StatusChip kicker="需求 2" name="查詢進度" state="done" />
        <StatusChip kicker="需求 3" name="下載檔案" state="done" />
        <StatusChip kicker="加分 · 串流" name="即時進度" state="extra" />
        <StatusChip kicker="需求 4" name="API 文件" state="done" />
        <StatusChip kicker="需求 5" name="Docker" state="done" />
        <StatusChip kicker="需求 6" name="自動測試" state="done" />
        <StatusChip kicker="加分 · 部署" name="公開部署" state="missing" />
      </div>
      <div style={{ ...abs(GUTTER, 580), fontSize: 26, fontWeight: 700, color: INK }}>送出一個匯出工作後，要等多久？</div>
      <BarRow y={624} label="中位數" bar={40} color={BLUE} value="4 s" live={live} delay={0.2} />
      <BarRow y={684} label="p95" bar={210} color={BLUE} value="30 s" live={live} delay={0.3} />
      <BarRow y={744} label="最慢實測" bar={1180} color={CORAL} inside="170 s" live={live} delay={0.4} />
      <p style={{ ...abs(GUTTER, 812, CONTENT_W), margin: 0, fontSize: 22, color: MUTED }}>
        範例數據。實際簡報要寫出在哪裡、用什麼條件量到的，換環境數字會不同。
      </p>
      <SoWhat label="所以">等的時候，使用者會重送、會斷線，server 也可能當機；後面的設計都在處理這段時間。</SoWhat>
      <Footer />
    </div>
  );
};

const Overview: Page = () => (
  <div style={root}>
    <PageHead eyebrow="系統全貌" size={MAIN_TITLE} at={1}>
      系統只有三塊：API、資料庫、儲存
    </PageHead>
    <div style={abs(GUTTER, BODY_TOP)}>
      <SystemMap spec={MAP} width={1100} detail>
        <MapLetter x={675} y={100} c="A" />
        <MapLetter x={675} y={420} c="B" />
        <MapLetter x={1000} y={100} c="C" />
      </SystemMap>
    </div>
    <div style={abs(1290, BODY_TOP, 510)}>
      <div style={{ fontSize: 24, fontWeight: 780, letterSpacing: '0.04em', color: MUTED }}>一個工作怎麼走</div>
      <MarkList
        items={[
          ['1', '使用者送出匯出請求'],
          ['2', '受理：鎖住、寫進資料庫'],
          ['3', '背景產生檔案、上傳'],
          ['4', '寫回狀態、回給使用者'],
        ]}
      />
      <div style={{ marginTop: 48, fontSize: 24, fontWeight: 780, letterSpacing: '0.04em', color: MUTED }}>三個設計，接下來逐頁放大</div>
      <MarkList
        mark="letter"
        size={32}
        items={[
          ['A', '受理和產生分兩段'],
          ['B', '規則交給資料庫'],
          ['C', '儲存只走一個接口'],
        ]}
      />
    </div>
    <SoWhat label="交付">整套用一個 docker compose 啟動；儲存在雲端或本機，只差一個設定檔。</SoWhat>
    <Footer />
  </div>
);

const ZoomA: Page = () => (
  <div style={root}>
    <PageHead eyebrow="放大 A · API 服務" size={MAIN_TITLE} at={2}>
      受理和產生分兩段：快的當場拿，慢的不佔連線
    </PageHead>
    <MiniMap spec={MAP} focus={['accept', 'build']} />
    <TradeCard
      choose="產生工作跑在 API process 裡"
      reject="queue＋獨立的 worker"
      cost="只能單台、同時產生的數量有上限"
      tag={<Tag label="Build" />}
    />
    <div style={{ ...abs(RIGHT_X, BODY_TOP, RIGHT_W), display: 'flex', gap: 28 }}>
      <PhaseCard title="受理" tint={TINT_BLUE}>
        一個短 transaction：
        <br />
        做檢查、寫入工作，
        <br />
        然後 commit
      </PhaseCard>
      <PhaseCard title="背景產生" tint={TINT_GREEN}>
        commit 後才開始產生；
        <br />
        定期寫進度，
        <br />
        最後寫一次結果
      </PhaseCard>
    </div>
    <SectionLabel top={562}>client 怎麼拿結果</SectionLabel>
    <div style={{ ...abs(RIGHT_X, 606, RIGHT_W), display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Steps>
        <Step>
          <RowCard name="同步等待" desc="短工作當場拿到；超時改回 202＋查詢網址" tint={TINT_BLUE} />
        </Step>
        <Step>
          <RowCard name="輪詢" desc="產生中也看得到目前的進度" tint={TINT_YELLOW} />
        </Step>
        <Step>
          <RowCard name="串流" desc="即時推送進度；斷線重連先補狀態" tint={TINT_GREEN} />
        </Step>
      </Steps>
    </div>
    <Footer />
  </div>
);

const ZoomB: Page = () => (
  <div style={root}>
    <PageHead eyebrow="放大 B · PostgreSQL" size={MAIN_TITLE} at={3}>
      規則交給資料庫：重送、同時送、當機都擋得住
    </PageHead>
    <MiniMap spec={MAP} focus={['db']} />
    <TradeCard choose="規則放在 PostgreSQL：鎖＋約束" reject="記憶體裡的鎖、heartbeat" cost="當機的工作要等逾時後，才會被回收" />
    <div style={{ ...abs(RIGHT_X, BODY_TOP, RIGHT_W), display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Steps>
        <Step>
          <ScenarioRow
            n="1"
            when={<>使用者<br />連按兩次</>}
            guard={<>第二次帶同一個請求 id，<br />直接回傳原本那筆工作。</>}
            mech="client 自帶的 request id"
            tint={TINT_YELLOW}
          />
        </Step>
        <Step>
          <ScenarioRow
            n="2"
            when={<>兩個請求<br />同時送進來</>}
            guard={<>row lock 讓請求排隊，<br />同時只有一筆在產生。</>}
            mech="partial unique index"
            tint={TINT_BLUE}
          />
        </Step>
        <Step>
          <ScenarioRow
            n="3"
            when={<>產生到一半<br />server 當機</>}
            guard={<>逾時後由下一個請求回收；<br />舊工作醒來也寫不進去。</>}
            mech="fenced UPDATE（attempt＋status）"
            tint={TINT_PINK}
          />
        </Step>
      </Steps>
    </div>
    <Footer />
  </div>
);

const ZoomC: Page = () => (
  <div style={root}>
    <PageHead eyebrow="放大 C · 儲存" size={MAIN_TITLE} at={4}>
      儲存只走一個接口：換位置只改設定
    </PageHead>
    <MiniMap spec={MAP} focus={['cloud', 'disk']} />
    <TradeCard choose="一個 Storage 介面，兩個實作" reject="直接呼叫雲端 SDK" cost="只用到兩邊共有的功能" />
    <SectionLabel top={BODY_TOP}>一個 Storage 介面</SectionLabel>
    <div style={{ ...abs(RIGHT_X, 344, RIGHT_W), display: 'flex', flexDirection: 'column', gap: 12 }}>
      <StatusRow name="物件儲存" where="雲端，需要憑證" status="✓ 已整合" />
      <StatusRow name="本機磁碟" where="地端環境，選用" status="✓ 已整合" />
      <StatusRow name="NAS" where="客戶常見，同樣是檔案系統" status="未實測" dashed />
    </div>
    <SectionLabel top={640}>憑證怎麼處理</SectionLabel>
    <div style={{ ...abs(RIGHT_X, 684, RIGHT_W), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <NumberChip n="1">從設定或請求帶入</NumberChip>
      <NumberChip n="2">印出只有 [REDACTED]</NumberChip>
      <NumberChip n="3">只交給這次上傳</NumberChip>
      <NumberChip n="4">不寫進資料庫和 log</NumberChip>
    </div>
    <Footer />
  </div>
);

const Proof: Page = () => (
  <div style={root}>
    <PageHead eyebrow="怎麼證明" size={MAIN_TITLE} at={5}>
      每條規則都有對應測試；真的儲存另外驗
    </PageHead>
    <MiniMap spec={MAP}>
      <MapBoundary x={186} y={86} w={508} h={458} />
      <MapBoundary x={742} y={86} w={274} h={290} color={BLUE} />
      <MapSticker x={206} y={54} w={430} label="① 每個 PR：真 DB＋假儲存" />
      <MapSticker x={742} y={400} w={274} label="② 真儲存" fill={NOTE_BLUE} />
    </MiniMap>
    <SideCard label="還沒驗證">
      <ListBlock size={27} items={['大量同時匯出的負載', '多個 API process 同時跑', '真實網路環境的串流']} />
    </SideCard>
    <div style={abs(RIGHT_X, BODY_TOP, RIGHT_W)}>
      <RuleHeader cols={['規則', '怎麼測（真資料庫）', 'test']} />
      <RuleLine first rule="一筆請求一份工作" how="同時送兩個：一個受理，一個 409" test="jobs-send" />
      <RuleLine rule="重送回傳同一筆" how="同 id：拿回同一份工作" test="jobs-replay" />
      <RuleLine rule="舊工作寫不進去" how="被回收後才完成，什麼都改不到" test="jobs-reclaim" />
      <RuleLine rule="憑證不留下" how="哨兵值掃 log、資料庫與回應" test="sentinel" />
    </div>
    <SectionLabel top={652}>兩層 CI（範例）</SectionLabel>
    <div style={{ ...abs(RIGHT_X, 694, RIGHT_W), display: 'flex', flexDirection: 'column', gap: 10, fontSize: 26, color: BODY }}>
      <div>
        <b style={{ color: INK }}>① 每個 PR</b>　真資料庫＋假儲存，快、結果固定
      </div>
      <div>
        <b style={{ color: INK }}>② 真儲存</b>　要憑證：只在 main 或手動時跑
      </div>
    </div>
    <Footer />
  </div>
);

const Next: Page = () => (
  <div style={root}>
    <PageHead eyebrow="限制與下一步" size={MAIN_TITLE} at={6}>
      可在單台交付；上線前還缺身分驗證與部署量測
    </PageHead>
    <MiniMap spec={MAP}>
      <MapGhost x={-6} y={84} w={162} h={88} title="身分驗證" />
      <MapGhost x={760} y={414} w={240} h={110} title="第二台 API" />
      <MapLink d="M756 470H682" />
    </MiniMap>
    <SideCard label="定位">
      <div style={{ fontSize: 30, fontWeight: 760, lineHeight: 1.5, color: INK }}>
        可交付的單台版本，
        <br />
        不是完整的 production 系統；
        <br />
        缺的部分都列出來了。
      </div>
    </SideCard>
    <div style={{ ...abs(RIGHT_X, BODY_TOP, RIGHT_W), display: 'flex', flexDirection: 'column', gap: 16 }}>
      <GroupRow title="已知限制" sub="設計上接受的代價" height={190} tint={TINT_PINK}>
        沒有身分驗證 · 只能單台 · 當機的工作要等逾時才回收
      </GroupRow>
      <GroupRow title="尚未驗證" sub="有實作，沒量測" height={190} tint={TINT_YELLOW}>
        大量同時匯出 · 多個 API process · NAS 只確認介面相容
      </GroupRow>
      <GroupRow title="下一步" sub="依優先順序" height={230} tint={TINT_GREEN}>
        部署並量測 → 身分與擁有者 → 多台改用 jobs table（圖上的第二台 API）
      </GroupRow>
    </div>
    <Footer />
  </div>
);

const BackupSteps: Page = () => (
  <div style={root}>
    <PageHead eyebrow="備用 · P04 受理" at={2} backup>
      受理的 4 個步驟
    </PageHead>
    <div style={{ ...abs(GUTTER, BODY_TOP, CONTENT_W), display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <NumberChip n="1" tint={TINT_BLUE}>鎖住這個使用者的工作列</NumberChip>
      <NumberChip n="2" tint={TINT_BLUE}>重送檢查：同 id 直接回傳</NumberChip>
      <NumberChip n="3" tint={TINT_BLUE}>容量檢查：滿了回 503</NumberChip>
      <NumberChip n="4" tint={TINT_BLUE}>寫入工作，commit</NumberChip>
    </div>
    <SoWhat>順序本身就是設計：任何拒絕都不佔名額。</SoWhat>
    <Footer />
  </div>
);

export const notes: (string | undefined)[] = [
  // 01 Cover
  `（約 10 秒）
開場一句話主線，告訴聽眾大概幾分鐘、細節在備用頁、可以隨時打斷。`,
  // 02 Status
  `（約 45 秒）
先回答「做了什麼」，再用一個數字說明難點在哪裡。數字一定要說在哪裡量的。`,
  // 03 Overview
  `（約 60 秒）
整個系統只有三塊。給非技術聽眾一個比方，例如櫃台、廚房、帳本。照編號走一次流程，最後點出 A、B、C 三個設計，接下來逐頁放大。`,
  // 04 ZoomA
  `（約 60 秒，按 → 依序出現三種方式）
放大 A：兩段各做什麼、client 有哪幾種拿結果的方式。最後講左下的取捨：選了什麼、沒選什麼、代價是什麼。`,
  // 05 ZoomB
  `（約 60 秒，按 → 依序出現三個情境）
放大 B：三種意外各怎麼擋，為什麼要交給資料庫。最後講代價。`,
  // 06 ZoomC
  `（約 45 秒）
放大 C：一個介面接多種儲存；沒實測的要直接說沒實測。`,
  // 07 Proof
  `（約 50 秒）
左邊的框是每個 PR 都測的範圍，右邊是規則對應的測試。最後主動講還沒驗證的部分。`,
  // 08 Next
  `（約 40 秒）
虛線是還沒有的部分。分成已知限制、尚未驗證、下一步。用定位那句話收尾，邀請提問。`,
  // B1 BackupSteps
  `（備用：被問到受理順序時）
說明每一步為什麼排在這個位置。`,
];

export const meta: SlideMeta = {
  title: '範例 deck',
  createdAt: '2026-11-03T14:25:05.617Z',
  theme: 'fieldwork',
};

export default [Cover, Status, Overview, ZoomA, ZoomB, ZoomC, Proof, Next, BackupSteps] satisfies Page[];
