來源：2026-11 面試設計說明 B 版（open-slide），旅程 5 頁與全貌頁
想解決：「一則請求怎麼走過系統」用文字講很抽象；讓聽眾看著同一個東西沿系統圖移動
狀態：用過一次（在原 deck 通過 check-layout 和截圖）；這裡的片段已改成 kit 的命名，還沒在 kit 裡驗證

# 旅程 morph 與流動的字

三個元件，都假設 deck 已貼上 `kit:base` 和 `kit:map`（用到 `abs`、`INK`、`CORAL`、`SystemMap`、`MapSpec`）。

| 元件 | 做什麼 |
|---|---|
| `toCanvas(spec, place, mx, my)` | 地圖座標 → 畫布座標，讓 HTML 元素能對準地圖上的點 |
| `MapOverlay` | 和地圖同一個座標系的透明 SVG 疊在上面，放編號、`<Step>` 裡的標記 |
| `Packet` | 訊息膠囊。每頁放同一個 `MorphElement id`，換頁時從上一站滑到下一站 |
| `TokenFlow` | 一串圓點沿路徑一直流動（例：模型回答的字流回使用者）；不是目前頁或使用者要求減少動態時，畫成靜態虛線 |

## 怎麼用

1. 系統圖用同一份 `MapSpec`，每頁畫在同一個位置（`place`），不然 morph 會亂跳。
2. 每一站一頁：`<Packet at={[x, y]} label="問題" />`，`at` 是地圖座標。
3. 那幾頁的 `transition` 用 `morphTransition`（有 `morph` 設定才會滑）。
4. 模型開始回答之後，拿掉 `Packet`，改放 `TokenFlow`，路徑寫在 `FLOWS`（地圖座標的 SVG path）。
5. 全貌頁 → 第一個放大頁：把整張圖包在 `<MorphElement id="map">`，下一頁的縮小版用同一個 id，圖會縮過去。

## 教訓

- 五站的旅程當主講太長（B 版最後移到備用頁）；當「被問到一則訊息怎麼走」時的備用頁很好用。
- 截圖、縮圖和列印時，動畫一定要停成靜態，不然每次截圖都不一樣，`check-layout` 也會不穩。
- 升級進 kit 前要做：把 `FLOWS` 改成 props、用範例 deck 驗證 morph（預覽要實際換頁看，截圖看不出來）。
