# tech-talk：技術設計說明的 pptx 範本

open-slide kit 的 pptx 版本：同一套顏色、同一種頁型。內容是去識別的「報表產生服務」情景，數字都是示意。

這 6 頁同時是 **golden sample**：改了範本或升級 ppt-master 後重新 build、render，和 `baseline/` 的截圖對照，看有沒有走樣。

| 檔案 | 頁面角色 | 版型 | 對應 open-slide kit |
|---|---|---|---|
| `svg/01_cover.svg` | cover | 深色底、左側珊瑚色直條、兩行大標 | `Title` 封面 |
| `svg/02_status.svg` | content | 左邊三張狀態卡（完成／未做）＋右邊一個大數字 | 狀態格＋大數字 |
| `svg/03_overview.svg` | content | 系統圖：方塊＋箭頭，選用的部分用虛線 | `SystemMap` |
| `svg/04_job_tradeoff.svg` | content | 三欄取捨卡：選擇／沒選／代價 | 取捨卡 |
| `svg/05_db_rules.svg` | content | 編號規則列，每列一句規則＋一行機制或測試 | 規則表 |
| `svg/06_next.svg` | ending | 三欄（限制／未驗證／下一步）＋深色結論列 | 限制頁 |

每頁共同的結構：
- 左上 18px 珊瑚色小標（章節）＋ 40px 結論式標題，框 `72 32 1136 100`
- 內容區 y 150–590，左右邊界 72
- 底部一條結論列（淡灰底或深色底），把這頁要留下的一句話放這裡

## 規格

`spec_lock.md` 鎖住畫布、顏色、字級，新專案直接複製（`pptx.mjs new --template tech-talk` 會自動做）。`communication` 和 `page_rhythm` 每份 deck 自己填。

字寬（Microsoft JhengHei，每 100 px 可放幾個字，2026-11-03 用 ppt-master `text_measure.py` 量的）：

| 角色 | 字級 | 中文 | 英數 |
|---|---:|---:|---:|
| cover | 64 | 1.5 | 3.0 |
| title | 40 | 2.4 | 4.9 |
| lead | 28 | 3.4 | 6.9 |
| body | 24 | 3.9 | 8.1 |
| annotation | 18 | 5.2 | 10.8 |

例：360 寬的卡片扣掉左右 32 留白，body 一行最多約 11 個中文字。估完再少 5%。

## 已知的軟問題

- 箭頭用 `<marker>` 畫，檢查通過，但不是 PowerPoint 原生的箭頭形狀；要原生的改用 ppt-master `preset_shape_svg.py render`。
- 18px 小標在投影時偏小，大場地考慮改 20。
