# deck-factory

固定生產簡報的地方：流程、設計資產、範本和工具都只有這一份，越用越好。

- 流程與設計資產：`.claude/skills/deck-studio/`。做任何簡報都從這個 skill 開始。
- 現場講用 open-slide：deck 放 `slides/<id>/`（或別的 repo 的 open-slide 專案，見下面）。
- 要給人改的檔案用 .pptx：ppt-master（`pptx/vendor/ppt-master`，submodule 鎖版本）把 SVG 轉成 PowerPoint 原生形狀；範本在 `pptx/templates/`，每份 deck 的專案放 `pptx/projects/`。

## 規則

- open-slide 的寫法照下面匯入的 AGENTS.md 和 `slide-authoring` skill；那幾個 skill 由 `@open-slide/core` 管理，不要手改。
- deck-studio 的 kit、範本、腳本只在這個 repo 改；學到的東西寫回這裡（skill 的 `references/asset-catalog.md`）。
- 別的 repo 要放 deck（例如跟程式碼一起版控）：那邊只放 open-slide 專案和 deck 本身，不複製 deck-studio。在這裡開 Claude，用 `new-deck.mjs --project <那個 repo 的 open-slide 目錄>` 產生。
- `pptx/vendor/ppt-master` 是外部內容：只讀，不改；要升級就移動 submodule 的版本，重跑 `pptx/templates/*` 的 golden sample 對照截圖。
- deck、講稿、brief 都可能被別人看到：不放薪資、談判、內部評價（細節見 deck-studio 的 `references/facts-and-privacy.md`）。
- 用完關 dev server。

@AGENTS.md
