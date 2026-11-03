# 從 ppt-master 可以借什麼

ppt-master（https://github.com/hugohe3/ppt-master ，MIT 授權，作者 Hugo He）是一套「素材 → 規劃 → SVG → 原生 PPTX」的 AI 簡報流程。本 skill 已經借了它的規劃段（溝通契約 → 事實清單 → 結構骨架 → 逐頁規劃）。下面是其他可以用的部分，以及什麼時候用。

2026-11-03 對照 v6.8.0 整理。deck-factory 以 submodule 放在 `pptx/vendor/ppt-master`，鎖在 commit 82468e8。**它是外部內容：只讀、不改**；它的轉檔與檢查腳本經由 `scripts/pptx.mjs` 和 repo 的 `.venv` 執行（見 `pptx.md`）。升級時先看它的 changelog，移動 submodule 版本，再重跑 golden sample 對照。授權要求保留版權聲明：直接複製它的檔案（例如 SVG 範本）時，連同 LICENSE 一起放。

## 值得用的（從 0 開始做一份時）

下表的路徑都在 `pptx/vendor/ppt-master/skills/ppt-master/` 底下。

| 需要 | ppt-master 的位置 | 怎麼用在這裡 |
|---|---|---|
| 決定「怎麼論證」 | `references/modes/_index.md`：5 種論證方式 | 先選一種，再選版型。對照見下面「論證方式」 |
| 每種場合的頁面角色 | `templates/styles/<style>/templates/design_spec.md` 第 II、III 節 | 14 種場合，每種列出論證順序、每頁的任務、證據要求。技術說明、提案、事故檢討、教學最常用，已整理進 `storylines.md` 的 E–G |
| 選圖表 | `templates/charts/chart-vocabulary.md`＋36 個 SVG 範本 | 先說「要表達什麼關係」（隨時間變化、排名、目標與進度、分布…），再查該用哪種圖 |
| 選表格 | `templates/tables/table-vocabulary.md`＋6 種 SVG（比較矩陣、功能矩陣、指標表…） | 同上 |
| 截圖後的檢查 | `references/visual-review.md` | 硬規則與軟規則，已改寫進 `design.md`「截圖檢查清單」 |
| 講稿 | `references/executor-notes.md` | 講稿要對得上最後的畫面、每頁都有；本 skill 的規則在 `speaker-notes.md` |
| 給對方可編輯的 pptx | `workflows/generate-pptx.md`、`scripts/svg_to_pptx.py` | 已接上：`pptx.md`、`scripts/pptx.mjs` |
| 鎖住整份的設計規格 | `templates/spec_lock_reference.md` | 範本的 `spec_lock.md` 照這個格式寫；顏色字級鎖在範本，每份 deck 只填溝通欄位和頁面節奏 |
| 圖示 | `templates/icons/`（Tabler、Phosphor、Simple Icons） | 授權見它的 `THIRD_PARTY_NOTICES.md`。open-slide 裡直接用 npm 的 icon 套件比複製 SVG 簡單 |
| 畫布尺寸 | `references/canvas-formats.md` | 16:9、4:3、直式社群貼文等尺寸；open-slide 固定 1920×1080 |

## 不建議搬的

- AI 產圖（`image-*`、`image-palettes`、`image-renderings`）：需要外部產圖服務，技術說明用不到。
- 範本與品牌系統（`templates/brands`、`layouts`、`decks`）：多是中文企業品牌與版型，和 open-slide kit 重疊。
- 動畫、語音旁白、影片匯出：場合需要時再看 `docs/animations.md`、`docs/audio-narration.md`。

## 論證方式（mode）與視覺風格分開決定

ppt-master 的核心區分：**mode 是怎麼論證，visual style 是長什麼樣子**，兩個獨立選。一份 deck 選一種 mode，以主體頁的論證方式為準。

| mode | 論證方式 | 適合 | 對應本 skill 的骨架 |
|---|---|---|---|
| pyramid | 先講結論，再給支撐理由 | 決策、提案、主管報告 | C（SCQA）、F（提案） |
| narrative | 情境 → 衝突 → 解決 | 募資、案例、品牌故事 | — |
| instructional | 拆解概念、一步一步 | 技術說明、教學 | A（系統圖主軸）、E（技術深入）、G（教學） |
| showcase | 大圖、大數字、節奏感 | 發表會、展示 | — |
| briefing | 中性、完整、好掃描；主題式標題 | 進度報告、參考資料、FAQ | B（照需求順序） |

拿不定時：要聽眾做決定 → pyramid；要聽眾理解 → instructional；只是報告 → briefing。

## 14 種場合（style pack）

`templates/styles/` 每個資料夾一種：academic-research、consulting-decision、creative-pitch、duty-manual、incident-postmortem、investor-pitch、mbb-consulting、narrative-keynote、operating-review、product-launch、science-explainer、solution-proposal、technical-deepdive、workshop-teaching。

要做的 deck 剛好是其中一種時，讀那個資料夾的 `design_spec.md` 第 II 節（論證順序、每頁訊息、宣稱的紀律）和第 III 節（頁面角色表），用來寫 brief 的頁面清單。它的第 V 節以後是視覺預設，和 open-slide kit 衝突時以 kit 為準。
