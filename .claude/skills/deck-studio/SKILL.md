---
name: deck-studio
description: 做簡報的完整流程與設計資產：受眾與溝通契約 → 事實清單 → 故事線與頁面清單 → 用 kit 搭 deck（系統圖主軸、進度條、取捨卡）→ 自動驗證（版面、講稿、時間）→ A/B → Q&A 準備。使用者要做簡報、投影片、deck、講稿、面試或提案報告、設計說明會、技術分享時使用。中文觸發：做簡報、做投影片、準備報告、面試簡報、offer call 要講的內容、設計說明、做 deck、講稿、彩排、簡報 A/B、可編輯 pptx、PowerPoint 檔。現場講輸出 open-slide，要交給別人改輸出 .pptx（ppt-master）；只改一頁字的小修直接用 open-slide 的 slide-authoring skill 即可。
---

# Deck Studio

一套可重複的簡報製作流程，加上一組驗證過的設計資產。流程不綁工具；資產有 open-slide（React）kit 和 pptx 範本兩種，用同一套顏色和頁型。

本 skill 住在 deck-factory repo（`.claude/skills/deck-studio/`），下面的相對路徑以 repo 根目錄為準。

## 核心原則

1. **先規劃、後動手**：brief（受眾、目的、事實、頁面清單）經使用者確認後才寫投影片。
2. **只用有來源的事實**：數字標明在哪裡、什麼條件下量到的；沒有的寫「待確認」或「待本人補充」，不編。
3. **一張圖當主軸**：技術說明以系統圖開場，後面每頁放大其中一塊；聽眾隨時知道現在講到哪。
4. **每頁一個視覺、一句結論**；解釋放講稿，細節放備用頁。
5. **講稿任何人都看得到**：不放薪資、談判、內部評價或任何不該外流的內容。
6. **用腳本驗證，再用眼睛看**：版面、講稿數量、時間、禁用詞都先跑腳本，最後看截圖。

## 流程（細節見 `references/process.md`）

| 階段 | 產出 | 關卡 |
|---|---|---|
| 0 開場 | 時長、場合、輸出工具、交付日 | — |
| 1 Brief | `templates/brief.md`：溝通契約、禁用詞、事實清單、待補 | **使用者確認** |
| 2 故事線 | 三個方向擇一（`references/storylines.md`）→ 頁面清單與時間 | **使用者挑方向**、**使用者確認頁面清單** |
| 3 搭建 | `scripts/new-deck.mjs` 產生 deck，填內容與講稿 | — |
| 4 驗證 | lint-deck、check-layout、tsc/build、截圖 | 全過才回報 |
| 5 修訂 / A/B | 方向已定、細節拿不定時另開 `<id>-b`，記錄在 `templates/revision-log.md` | 使用者選版 |
| 6 收尾 | `templates/qa-prep.md`、彩排時間、commit（使用者要求時）、關掉 dev server | — |
| 7 回饋資產 | 這次做出的好元件或教訓寫回本 skill（`references/asset-catalog.md`） | — |

## 快速開始（open-slide）

```bash
S=.claude/skills/deck-studio/scripts
node $S/new-deck.mjs --project . --id <slide-id> --title "<標題>"   # 範例 deck 起手；--project 也可指到別的 repo 的 open-slide 專案
node $S/new-deck.mjs --project <專案> --id <id> --title "<標題>" --blank            # 空白起手
node $S/lint-deck.mjs <專案>/slides/<id>/index.tsx --config <brief 旁的 lint.config.json>
node $S/check-layout.mjs --base http://localhost:<port> --slide <id> --pages 1-9
node $S/shoot.mjs --base http://localhost:<port> --slide <id> --pages 1-9 --out <scratchpad>/shots
node $S/new-deck.mjs --sync <專案>/slides/<id>/index.tsx                           # kit 更新後同步到舊 deck
```

- open-slide 規定一個 slide 只能有一個 `index.tsx`，所以 kit 會被貼進檔案，以 `// ==== deck-studio:kit <name> start/end ====` 包住。**kit 區塊不要在 deck 裡改**，改 skill 裡的 kit，再 `--sync`。
- deck 自己的內容（`DECK` 設定、系統圖 `MAP`、各頁、notes、meta）放在 kit 區塊之後。
- 寫頁面前照 open-slide 專案的 `slide-authoring` skill（畫布、Steps、notes 格式）；本 skill 管流程與版型。

## 快速開始（pptx）

```bash
node $S/pptx.mjs new <name> --template tech-talk     # pptx/projects/<name>_<date>，帶入範本頁與 spec_lock
node $S/pptx.mjs build pptx/projects/<name>_<date>   # 品質檢查（有錯就停）→ 轉成原生 PowerPoint 形狀
node $S/pptx.mjs render <file.pptx> --out <dir>      # 用 PowerPoint 輸出每頁 PNG，逐頁看
```

SVG 寫法、檢查範圍和已知的坑見 `references/pptx.md`；範本與頁型對照見 `pptx/templates/<name>/README.md`。

## 資產

| 位置 | 內容 |
|---|---|
| `assets/open-slide/kit/` | `base`（主題、格線、PageHead＋進度條、SoWhat、Footer）、`map`（SystemMap 與疊加層、MiniMap）、`cards`（取捨卡、狀態格、情境列、規則表等） |
| `assets/open-slide/example/pages.tsx` | 去識別的範例 deck：全貌 → 放大 A/B/C → 證明 → 限制 |
| `templates/` | brief、Q&A 準備、修訂紀錄、lint 設定 |
| `scripts/` | 產生／同步 deck、版面檢查、截圖、講稿與時間檢查 |
| `assets/inbox/` | 還沒通用化的新點子，之後再整理進 kit |
| repo 的 `pptx/templates/` | pptx 範本：SVG 頁型、`spec_lock.md`（鎖顏色字級）、`baseline/` 截圖（golden sample） |

元件目錄、使用時機和新增資產的步驟見 `references/asset-catalog.md`；設計規則（格線、字級、每行字數、配色、截圖檢查清單）見 `references/design.md`；事實與隱私規則見 `references/facts-and-privacy.md`；其他輸出工具（HTML、pptx）與 open-slide 的備用 deck、morph 做法見 `references/adapters.md`。

從 0 開始時先看：`references/storylines.md`（先選論證方式和骨架 A–G，寫成三個方向讓使用者挑）、`references/speaker-notes.md`（講稿怎麼寫）、`references/ppt-master.md`（ppt-master 還有哪些可以用：場合的頁面角色、圖表與表格選擇、可編輯 pptx）。

## 回報前的最低要求

- `lint-deck` 沒有禁用詞、notes 與頁數一致、時間在目標內
- `check-layout` 全部 ok（有例外要說明為什麼可以接受）
- 專案的 typecheck 與 build 通過
- pptx：`pptx.mjs build` 通過，`render` 的每頁截圖都看過
- 自己看過改動頁的截圖
- 跑不了的檢查要明說沒跑
