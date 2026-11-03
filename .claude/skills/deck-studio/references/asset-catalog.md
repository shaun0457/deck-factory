# 資產目錄與新增方式

## kit 元件（open-slide）

狀態：**stable**＝在真實 deck 用過並通過驗證；**experimental**＝只在範例用過。

### kit:base

| 元件 | 用途 | 狀態 |
|---|---|---|
| `design`、色彩常數、`GUTTER` 等格線常數 | Fieldwork 主題（中文版） | stable |
| `PageHead({ eyebrow, size, at, backup })` | eyebrow＋標題；有 `at` 時顯示進度條 | stable |
| `Progress({ at, backup })` | 章節進度條，讀 `DECK.chapters`；`at` 超出範圍會在 console 警告 | stable |
| `SoWhat({ label })` | 頁底一句結論 | stable |
| `Footer` | 名稱、署名、頁碼，讀 `DECK.name`、`DECK.byline` | stable |
| `Title`、`Heading`、`Eyebrow`、`TintCard`、`CardTitle`、`CardBody`、`Code`、`Dot`、`ListBlock`、`Mark` | 基本文字與卡片 | stable |
| `transition` | 頁面轉場 | stable |

### kit:map

| 元件 | 用途 | 狀態 |
|---|---|---|
| `MapSpec` 型別 | 節點、容器、連線、編號、viewBox | stable |
| `SystemMap({ spec, width, focus, detail, hops, label })` | 全貌（`detail`）或焦點亮起的縮小版。圖本身帶資訊、頁面文字沒重複時給 `label`（變成 `role="img"`），否則對螢幕閱讀器隱藏；focus、frame、edge、hop 引用不存在的 node id 會在 console 警告 | stable |
| `MiniMap({ spec, focus, hops, label })` | 放大頁左上的縮小系統圖 | stable |
| `MapLetter` | 熱點字母 A/B/C | stable |
| `MapBoundary`、`MapSticker` | 框出範圍＋標籤（例：每個 PR 測哪些） | stable |
| `MapGhost`、`MapLink` | 還不存在的部分（下一步、缺口） | stable |

### kit:cards

| 元件 | 用途 | 狀態 |
|---|---|---|
| `TradeCard({ choose, reject, cost, tag })` | 選擇／沒選／代價 | stable |
| `SideCard({ label })` | 放大頁左下的通用卡（還沒驗證、定位） | stable |
| `Tag({ label, good })` | Build／Reuse 之類的小標籤 | stable |
| `SectionLabel`、`MarkList` | 右欄小標題、編號或字母清單 | stable |
| `StatusChip({ kicker, name, state })` | 需求完成狀態格：done ✓、extra ★、missing ✗（不只靠顏色區分） | stable |
| `BarRow` | 會長出來的長條（時間、數量） | stable |
| `PhaseCard`、`RowCard` | 階段卡、一列式說明 | stable |
| `ScenarioRow` | 情境 → 怎麼處理 → 機制 | stable |
| `RuleHeader`、`RuleLine` | 規則 → 怎麼測 → 測試名稱 | stable |
| `GroupRow` | 已知限制／尚未驗證／下一步 | stable |
| `StatusRow` | 整合狀態（虛線＝未實測） | stable |
| `NumberChip` | 編號步驟格 | stable |

## 其他資產

| 位置 | 內容 |
|---|---|
| `assets/open-slide/example/pages.tsx` | 範例 deck（骨架 A），`new-deck.mjs` 預設用它起手 |
| `templates/*.md` | brief、Q&A、修訂紀錄 |
| `templates/lint.config.json` | 禁用詞與時間目標範例 |
| `assets/inbox/` | 還沒整理的點子 |

## 新增資產的步驟

1. **先在真實 deck 裡做出來**，通過 `check-layout` 並看過截圖。
2. **去掉專案內容**：文字、數字、顏色以外的專案假設都改成 props；不要讀 `DECK` 以外的 deck 常數。
3. **放進 kit**：加到 `assets/open-slide/kit/` 對應的模組；新類別就新增模組檔，並加進 `scripts/new-deck.mjs` 的 `MODULES`（順序：header、base、其他）。
4. **示範用法**：在 `example/pages.tsx` 用一次（主講頁或備用頁）。
5. **驗證**：把範例產生到一個暫時的 slide id，跑 typecheck、build、`check-layout`、`lint-deck`、截圖，再刪掉暫時的 slide。
6. **登記**：更新本頁的表格（狀態先標 experimental，第二份 deck 用過再改 stable）。
7. **舊 deck 要用新版 kit**：`new-deck.mjs --sync <index.tsx>`，再跑驗證。

## inbox（`assets/inbox/`）

還沒通用化的東西先放這裡：截圖、草圖、某份 deck 的片段、參考連結、想試的版型。每個點子一個檔案或資料夾，開頭寫「來源、想解決什麼、目前狀態」。在真實 deck 用過之後，照上面的步驟升級成 kit 元件。

目前有：

| 資料夾 | 內容 | 狀態 |
|---|---|---|
| `journey-morph/` | 訊息膠囊沿系統圖 morph、回答的字沿連線流動、地圖座標疊加層 | 用過一次 |
| `scenario-evidence/` | 出事情境表（情境 → 系統怎麼做 → 測試）、「擋住＋測試」證據列、方形設計編號與圓形情境編號 | 用過一次 |

## 其他輸出工具

新的工具（HTML、pptx…）放在 `assets/<adapter>/`，規則見 `adapters.md`。
