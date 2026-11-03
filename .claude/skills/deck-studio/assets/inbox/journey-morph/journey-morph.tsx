// Inbox snippet, not a kit module yet. Paste after the kit blocks of a deck.
// Expects in scope: abs, INK, CORAL, EASE_OUT (kit:base); SystemMap, MapSpec (kit:map).
// Expects imports: MorphElement, useIsActivePage, SlideTransition from '@open-slide/core'.

// Morph between journey pages: the packet glides, everything else fades.
const morphTransition: SlideTransition = {
  duration: 280,
  exit: { duration: 308, easing: 'cubic-bezier(0.4, 0, 1, 1)', keyframes: [{ opacity: 1 }, { opacity: 1 }] },
  enter: { duration: 308, easing: EASE_OUT, keyframes: [{ opacity: 0 }, { opacity: 1 }] },
  morph: { duration: 868, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
};

// Where a map is drawn on the canvas: top-left corner and width in px.
type Place = { x: number; y: number; w: number };

// Map coordinates → canvas px, for HTML elements that must sit on a map point.
const toCanvas = (spec: MapSpec, place: Place, mx: number, my: number) => {
  const [vx, vy, vw] = spec.view;
  return { x: place.x + ((mx - vx) * place.w) / vw, y: place.y + ((my - vy) * place.w) / vw };
};

// A transparent SVG in the map's coordinate space, so markers can sit in a <Step>.
const MapOverlay = ({ spec, place, children }: { spec: MapSpec; place: Place; children: ReactNode }) => {
  const [vx, vy, vw, vh] = spec.view;
  return (
    <div style={{ ...abs(place.x, place.y), pointerEvents: 'none' }}>
      <svg
        aria-hidden="true"
        width={place.w}
        height={(place.w * vh) / vw}
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {children}
      </svg>
    </div>
  );
};

// The message itself. The same MorphElement id on every journey page makes it glide between stops.
// Place it directly under the page root (not inside another positioned box), one per page:
// only the first element with a morph id is matched. `place` must equal where the map is drawn,
// e.g. the mini map is { x: GUTTER, y: BODY_TOP, w: MINI_W }.
const Packet = ({
  spec,
  place,
  at,
  label,
  small = false,
}: {
  spec: MapSpec;
  place: Place;
  at: [number, number];
  label: string;
  small?: boolean;
}) => {
  const c = toCanvas(spec, place, at[0], at[1]);
  const w = small ? 112 : 132;
  const h = small ? 44 : 52;
  return (
    <MorphElement id="packet">
      <div
        style={{
          position: 'absolute',
          left: Math.round(c.x - w / 2),
          top: Math.round(c.y - h / 2),
          width: w,
          height: h,
          boxSizing: 'border-box',
          borderRadius: h / 2,
          background: INK,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: small ? 21 : 24,
          fontWeight: 760,
          boxShadow: '0 6px 18px rgba(25,25,25,0.25)',
        }}
      >
        {label}
      </div>
    </MorphElement>
  );
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Dots moving along a path in map coordinates (draw it inside SystemMap's children or a MapOverlay).
// Negative begin offsets spread the dots out from the first frame. Off the active page
// (thumbnails, print, screenshots) or with reduced motion, the route is a still dashed line.
const TokenFlow = ({ d, n = 4, dur = 1.6, r = 6, color = CORAL }: { d: string; n?: number; dur?: number; r?: number; color?: string }) => {
  const live = useIsActivePage();
  if (!live || prefersReducedMotion()) {
    return <path d={d} fill="none" stroke={color} strokeWidth={Math.max(1, r - 2)} strokeDasharray="2 10" strokeLinecap="round" />;
  }
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size decoration
        <circle key={i} r={r} fill={color}>
          <animateMotion dur={`${dur}s`} begin={`-${((i * dur) / n).toFixed(2)}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}
    </>
  );
};
