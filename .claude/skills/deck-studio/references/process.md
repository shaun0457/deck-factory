# 流程細節

每個階段寫清楚：要做什麼、產出放哪、什麼時候停下來問使用者。brief 與修訂紀錄放在簡報專案的 `plan/`（或使用者指定的位置），不要放進 slide 資料夾（open-slide 只允許 `index.tsx` 和 `assets/`）。

## 0 開場（不用問的先自己查）

- 讀使用者給的素材：題目、repo、README、ADR、CI 結果、信件。
- 確認：時長（主講幾分鐘、整場多久）、場合（實體／視訊、誰分享螢幕）、聽眾、交付日、語言、輸出工具（現場講用 open-slide；要交給對方改的用 .pptx，見 `pptx.md`；兩種都要時先做 open-slide 定稿，再做 pptx）。
- deck 放哪：預設 deck-factory 的 `slides/`；要跟某個 repo 的程式碼一起版控時，放那個 repo 的 open-slide 專案（`new-deck.mjs --project <路徑>`），不複製 deck-studio 過去。
- 已經能從素材查到的就不要問；只有使用者才知道的（聽眾背景、目的、不能說的話）才問。

## 1 Brief（`templates/brief.md`）

1. **溝通契約**：audience（每位聽眾的背景與在意的事）、intent、audience_outcome（聽完能說出什麼）、core_message（一句話）、delivery_context、artifact_afterlife（會不會被轉傳）。
2. **禁用詞與界線**：使用者說過不能提的事、會誤導的說法、沒驗證過的宣稱。同時寫成 `lint.config.json` 的 `banned`，讓腳本擋。
3. **事實清單**：每個事實一個 ID，附來源（檔案、commit、CI run）與範圍（例如「只在某 API 上量到」）。投影片上的每個數字都要對得到 ID。
4. **待確認／待本人補充**：只有使用者知道的經驗、動機、數字。
5. **停下來給使用者確認**。

## 2 故事線與頁面清單

1. 依聽眾選骨架（`references/storylines.md`）。技術說明且有非技術聽眾在場時，優先用「系統圖主軸」。
2. 頁面清單：每頁寫章節、標題、唯一的視覺、講什麼、時間、對應的備用頁。主講時間加總要符合目標。
3. 標題風格：主題式（短）或結論式（一句話主張）。使用者沒有明確偏好時，做 A/B。
4. 決定章節（進度條上的 4–7 段）。
5. **停下來給使用者確認**。

## 3 搭建

1. `new-deck.mjs` 產生 deck（範例或空白）。
2. 先填 `DECK`（名稱、署名、章節）與系統圖 `MAP`，再逐頁替換內容。
3. 每頁用 kit 的版型；新的版型先在 deck 裡做，驗證過再考慮放回 kit（階段 7）。
4. 講稿：每頁開頭寫「（約 N 秒）」，按 → 有出現順序時寫明；備用頁講稿以「（備用：被問到…時）」開頭。講稿用口語，不念投影片上的字。
5. 中文換行用 `<br />` 手動斷，不要讓瀏覽器斷在詞中間（每行字數估算見 `design.md`）。
6. pptx：`pptx.mjs new <name> --template <範本>` 建專案，照頁面清單改 `svg_output/` 的 SVG（規則見 `pptx.md`）。

## 4 驗證（每次改完都跑）

```bash
node $S/lint-deck.mjs <index.tsx> --config <plan>/lint.config.json
node $S/check-layout.mjs --base http://localhost:<port> --slide <id> --pages <主講與改動頁>
<專案的 typecheck>   # open-slide：tsc --noEmit -p <專案>
<專案的 build>       # open-slide：pnpm build
node $S/shoot.mjs --base ... --slide <id> --pages <改動頁> --out <scratchpad>
```

pptx 版：

```bash
node $S/pptx.mjs build pptx/projects/<專案>          # 品質檢查沒過就不會轉檔
node $S/pptx.mjs render <產出的 .pptx> --out <scratchpad>/pptx-shots
```

- 截圖一定要自己看：腳本只抓溢出、重疊、跑出畫布，抓不到「不好看」和「講錯」。
- Chrome 擴充的截圖容易逾時，用 `shoot.mjs`（headless）。
- 寫檔和驗證分兩輪：寫完檔，下一輪再跑驗證。

### 4b 角色審查（重要場合才做）

腳本抓不到「講錯」。重要的簡報在定稿前派幾個 agent 各扮一個聽眾，只讀不改，回報有問題的說法：

| 角色 | 看什麼 |
|---|---|
| 主要決策者（例：CEO） | 因果講得通嗎、看得出判斷力嗎、最可能追問什麼 |
| 資深工程師 | 技術說法和實作是否一致、有沒有誇大 |
| 非技術聽眾（例：HR）＋領域角色 | 聽不聽得懂、術語是否太多 |
| 讀程式碼的 agent（例：Codex） | 投影片與講稿的每個數字、檔名、行為，對照提交的 commit |

- 每一輪把發現編號（F1、F2…），修完再派一輪驗收；記在修訂紀錄。
- 對照的是「實際提交的版本」（固定的 commit），不是工作目錄。
- B 版跑了 4 輪，第 3 輪抓到 16 處說法要修（例：某個逾時只適用其中一個 provider、CI 證據要指向哪個 commit、沒實測的整合不能講成支援）。

## 5 修訂與 A/B

- 大改版另開 `<id>-b`，原版不動，兩版都 commit 方便比較。
- `templates/revision-log.md` 記錄：診斷、逐頁對照（原頁 → 處理 → 新標題 → 原因 → 時間）、來源與待確認。
- 使用者選定後，把勝出版本的改動寫回修訂紀錄，必要時把版型抽回 kit。

## 6 收尾

- `templates/qa-prep.md`：最可能被追問的 5–8 題、簡答、依據、弱點、待本人補充。
- 講稿改成講者自己的說法，一頁一頁來（`speaker-notes.md`）。
- 備用頁另開一份 deck，主講最後一頁按 → 不會跑出去（`adapters.md`）。
- 彩排：用 lint-deck 的時間加總對照實際口說；超時就砍頁或把內容移到備用。
- commit 只在使用者要求時做；push 一定先問。
- 用完關掉自己開的 dev server 和背景程序。

## 7 回饋資產

做完一份 deck 後問一次：「這次有沒有值得留下的版型、元件、教訓？」有的話照 `asset-catalog.md` 的步驟放回 skill：
- 驗證過的元件 → `assets/open-slide/kit/`；pptx 的新頁型 → repo 的 `pptx/templates/<範本>/svg/`，連同 baseline 截圖
- 還沒通用化的點子 → `assets/inbox/`
- 流程或設計教訓 → 對應的 references 檔

## 這套流程從哪來

- ppt-master 的 Strategist 階段：溝通契約 → 事實清單 → 結構骨架 → 逐頁規劃，再製作。
- 2026-11 一份面試設計說明：A 版照題目順序（主題式標題）、B 版改成系統圖主軸＋進度條＋取捨卡，使用者評為「好非常多」。教訓：
  - 有非技術聽眾時，缺一張全貌圖，後面每頁都會變難懂。
  - 單獨插一頁系統圖會很突兀，要讓整份 deck 都從那張圖展開。
  - 取捨跟著它所在的元件講，比集中在一張大表好懂。
  - 每頁塞滿細節像設計文件；細節放備用頁，備用頁 eyebrow 指回主頁（例：「備用 · P04 受理」）。
  - 每頁都硬接 hook 會像流水帳；用一條貫穿的主線就夠。
- 同一份 B 版之後又改了 5 版（2026-11-01 至 11-02），教訓：
  - 主講從「品質面向」改成「我的 N 個設計」，聽眾比較容易記住；結構見 `storylines.md` A2。
  - 一則訊息走一遍的旅程很直觀，但放主講太長，改當備用頁。
  - 講稿改最多次：從書面語改成口語，再換成講者自己的話（`speaker-notes.md`）。
  - 角色審查抓到的說法錯誤，比版面問題多很多（上面 4b）。
- ppt-master 其他可用的部分（論證方式、場合的頁面角色、圖表選擇、截圖檢查）見 `ppt-master.md`。
