# 輸出工具（adapter）

流程（brief、故事線、事實、A/B、Q&A）不依賴工具；版型元件和驗證腳本依工具而不同。

## open-slide（預設，已完成）

- 專案結構：`slides/<id>/index.tsx`（單一檔案）＋可選的 `assets/`；主題在專案的 `themes/`。
- 技術規則以專案內的 `slide-authoring` skill 為準：檔案格式、`notes` 與頁面 index 對齊、`Steps`、`meta.createdAt`。
- 預覽網址：`http://localhost:<port>/s/<id>/preview?p=<頁碼>`；dev server 用 `pnpm dev`，預設 port 5173，被占用時會換。
- typecheck：專案沒有 `tsc` 時，可以借用其他專案的 `node_modules/.bin/tsc --noEmit -p <專案>`；build：`pnpm build`。
- kit 產生與同步：`scripts/new-deck.mjs`。

### open-slide 的做法（B 版驗證過）

**備用頁另開一份 deck**：open-slide 沒有隱藏頁，備用頁放在同一份裡，主講最後一頁按 → 就會跑進備用頁。做法：

- 頁面和講稿仍寫在主講檔，另外 export：`export const backupPages = [...] satisfies Page[]`、`export const backupNotes = [...]`。
- 另開 `slides/<id>-backup/index.tsx`，只 re-export：

  ```tsx
  import type { SlideMeta } from '@open-slide/core';
  import { backupNotes, backupPages } from '../<id>/index';
  export { design, transition } from '../<id>/index';
  export const notes = backupNotes;
  export const meta: SlideMeta = { title: '<標題>（備用頁）', createdAt: '<ISO 時間>', theme: '<主題>' };
  export default backupPages;
  ```

- 被問到時，從簡報者視窗的 deck 切換器開備用 deck。
- 注意：改了主講檔要重新整理兩個視窗（備用 deck 不會 hot-reload）；兩份要一起改名或刪除，否則 import 會壞；inspector、評論、current-slide 都指向主講檔。

**頁與頁之間的 morph**：同一個 `MorphElement id` 放在連續幾頁，元素會從上一頁的位置滑到下一頁的位置（例：全貌頁的系統圖縮成下一頁的縮小版；訊息膠囊沿著圖移動）。頁面的 `transition` 要有 `morph` 設定。範例在 `assets/inbox/journey-morph/`。

**只在目前這頁跑的動畫**：用 `useIsActivePage()` 判斷；不是目前頁（縮圖、列印、截圖）或使用者設了 `prefers-reduced-motion` 時，改畫成靜態虛線。不然縮圖和截圖會每次都不一樣。

## 新增 adapter 的條件

1. 在 `assets/<adapter>/` 放同一組概念的元件：PageHead＋進度條、SystemMap（全貌與縮小版、疊加層）、TradeCard 與其他 cards。
2. 範例 deck 用同一份內容（骨架 A），方便和 open-slide 版比對。
3. 驗證腳本：至少要有截圖；版面檢查能重用 `check-layout.mjs` 的檢查邏輯（HTML 類輸出可直接用）。
4. 在 `SKILL.md` 的快速開始與本檔補上指令。

## 候選

- **HTML 單頁**（可分享的 artifact）：系統圖可直接沿用 SVG；適合會後給人自己看的版本。
- **pptx**：已接上，見 `pptx.md`（ppt-master 把 SVG 轉成 PowerPoint 原生形狀，圖和字都能在 PowerPoint 裡改）。
