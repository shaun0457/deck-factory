# deck-factory

穩定產出簡報的工作區：一套流程（deck-studio skill）、兩種輸出。

| 輸出 | 用途 | 工具 |
|---|---|---|
| open-slide | 現場講、要動畫和講者模式 | `slides/<id>/index.tsx`，用 deck-studio kit |
| .pptx | 要交給別人改、要放進對方的簡報 | ppt-master：SVG → PowerPoint 原生形狀（可編輯，不是圖片） |

## 第一次設定

```bash
git submodule update --init          # ppt-master（鎖在 82468e8）
pnpm install                         # open-slide
py -3.12 -m venv .venv               # ppt-master 的 Python 環境
.venv/Scripts/python -m pip install -r pptx/vendor/ppt-master/requirements.txt
```

repo 要放在短路徑（例如 `C:\Users\<you>\projects\deck-factory`）：ppt-master 轉檔時的暫存資料夾很深，Windows 路徑超過 260 字元會失敗。

## 常用指令

```bash
S=.claude/skills/deck-studio/scripts

# open-slide
pnpm dev
node $S/new-deck.mjs --project . --id <slide-id> --title "<標題>"
node $S/lint-deck.mjs slides/<id>/index.tsx --config <lint.config.json>
node $S/check-layout.mjs --base http://localhost:5173 --slide <id> --pages 1-9

# pptx
node $S/pptx.mjs new <name> --template tech-talk     # 建專案並帶入範本頁
node $S/pptx.mjs build pptx/projects/<name>_<date>   # 檢查 → 轉 pptx
node $S/pptx.mjs render <file.pptx> --out <dir>      # 用 PowerPoint 輸出每頁 PNG
```

完整流程見 `.claude/skills/deck-studio/SKILL.md`。

## 目錄

```
.claude/skills/deck-studio/   流程、設計規則、kit、腳本、模板
.claude/skills/<open-slide>/  open-slide 自帶的 skill（pnpm sync:skills 管理）
slides/                       open-slide deck
pptx/templates/<name>/        pptx 範本：svg/、spec_lock.md、baseline/ 截圖
pptx/projects/                每份 pptx deck 的 ppt-master 專案
pptx/vendor/ppt-master/       ppt-master（MIT，hugohe3/ppt-master），只讀
```

## 授權

ppt-master 為 MIT 授權（Copyright Hugo He），以 submodule 引用，未修改。
