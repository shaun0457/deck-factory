# 可編輯的 .pptx（ppt-master）

用在要交給對方改、或要放進對方簡報的時候。現場講還是用 open-slide。兩種都要時，先把 open-slide 版定稿（內容、講稿都確定），再照頁面清單做 pptx，不要兩邊同時改內容。

工具：repo 的 `pptx/vendor/ppt-master`（submodule，鎖在 82468e8），用 `scripts/pptx.mjs` 呼叫，不直接跑它的腳本。它把 SVG 轉成 PowerPoint 原生的文字方塊、形狀和群組，對方能直接點進去改；2026-11-03 試跑 6 頁，0 張圖片。

## 步驟

1. `node $S/pptx.mjs new <name> --template tech-talk`：在 `pptx/projects/` 建專案，帶入範本的 `svg_output/` 和 `spec_lock.md`。
2. 填 `spec_lock.md` 的 `communication` 和 `page_rhythm`（每頁 anchor／dense／breathing）。顏色、字級不改；要改就改範本，不在單一 deck 裡改。
3. 照頁面清單改 SVG：複製最接近的範本頁，換字、調整卡片數量。檔名 `NN_<slug>.svg`，照順序。
4. `node $S/pptx.mjs build <專案>`：先跑品質檢查，有錯誤就停；過了才轉檔，`exports/` 產出 .pptx。
5. `node $S/pptx.mjs render <.pptx> --out <scratchpad>/pptx-shots`：用 PowerPoint 本身輸出每頁 PNG，逐頁看（`design.md` 的截圖檢查清單）。

## SVG 寫法（檢查會擋的）

- 根元素：`viewBox="0 0 1280 720"`、`lang="zh-Hant"`、`data-pptx-page-role`（cover／content／ending…）、`font-family="Microsoft JhengHei"`。
- 背景是一個 `<rect data-pptx-role="background">`。
- 每個頂層區塊是 `<g id="…" data-pptx-bounds="x y w h">`；區塊之間不重疊，文字不能超出自己的 bounds（超過 5% 是錯誤）。
- 一段文字一個 `<text>`，換行用 `<tspan x="…" dy="…">`。PowerPoint 不會自動換行，每行字數要自己算（範本 README 有每 100 px 的字數表）。
- 顏色寫大寫 `#RRGGBB`。不能用 `<style>`、class、mask、foreignObject、動畫、script；文字裡不能用 HTML entity（`&nbsp;` 之類），XML 保留字元要跳脫（`&apos;`）。
- 箭頭：`<marker>` 可以過檢查；要 PowerPoint 原生箭頭形狀時用 ppt-master 的 `preset_shape_svg.py render`。

## 檢查的範圍

| 檢查 | 誰做 | 抓什麼 |
|---|---|---|
| 品質檢查（build 內建，會擋） | ppt-master `svg_quality_checker.py` | 寫法不合規、bounds 重疊、文字超出 bounds |
| 轉檔後檢查（build 內建） | ppt-master postflight | 投影片數、轉檔警告 |
| 截圖 | `pptx.mjs render`＋自己看 | 空白太多、字太小、對齊、講錯 |
| golden sample | 改範本或升級 ppt-master 後，重 build 範本並和 `baseline/` 對照 | 轉檔行為改變 |

## 已知的坑

- Windows 路徑上限 260 字元：轉檔的暫存資料夾很深，專案路徑超過 120 字元時 `pptx.mjs` 會拒絕。專案放 `pptx/projects/`，repo 放短路徑。
- 轉檔只接受帶 `--json` 跑出來、且對應目前 `svg_output/` 的檢查報告；`pptx.mjs build` 已經照順序跑。
- `render` 會用到使用者的 PowerPoint：本來就開著的話只關自己開的簡報，不關整個 PowerPoint；要 render 的檔案正開在 PowerPoint 裡時會拒絕（避免丟掉未存的修改）。逾時後 PowerPoint 可能還掛在背景，要到工作管理員結束 POWERPNT.EXE 再重跑。
- `render` 會先刪掉輸出資料夾裡舊的 `slideNN.png`，資料夾裡的圖一定是這次的。
- 檢查通過不代表好看：試跑時抓不到「兩張卡片下半部空著」，是看截圖才發現的。
