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
