// ---------- Deck: content for this talk ----------
// Example deck: a fictional "report export" service. Every number below is a
// placeholder marked 範例; replace the content, keep the page patterns.

const DECK = {
  name: '__TITLE__',
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
  title: '__TITLE__',
  createdAt: '__CREATED_AT__',
  theme: 'fieldwork',
};

export default [Cover, Status, Overview, ZoomA, ZoomB, ZoomC, Proof, Next, BackupSteps] satisfies Page[];
