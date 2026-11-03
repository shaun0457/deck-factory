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
