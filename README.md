# deck-factory

穩定產出簡報的工作區：一套流程（deck-studio skill）、兩種輸出。

| 輸出 | 用途 | 工具 |
|---|---|---|
| open-slide | 現場講、要動畫和講者模式 | `slides/<id>/index.tsx`，用 deck-studio kit |
| .pptx | 要交給別人改、要放進對方的簡報 | ppt-master：SVG → PowerPoint 原生形狀（可編輯，不是圖片） |

## 在新電腦第一次設定

需要先裝好：

| 工具 | 用途 | 備註 |
|---|---|---|
| Git、GitHub CLI（`gh`） | clone 這個 private repo | `gh auth login` 登入有權限的帳號 |
| Node.js 22 以上、pnpm | open-slide、deck-studio 的腳本 | pnpm：`npm i -g pnpm` |
| Python 3.12 | ppt-master | Windows 用 `py -3.12` 確認有裝 |
| PowerPoint（Windows） | `pptx.mjs render` 輸出每頁截圖 | 只做 pptx 不截圖可以不裝 |
| Microsoft JhengHei 字型 | pptx 範本的中文字型 | Windows 內建；macOS 開 pptx 會被換成別的字型，版面可能跑掉 |

步驟（Windows 用 Git Bash；macOS/Linux 把 `.venv/Scripts/python` 換成 `.venv/bin/python`）：

```bash
# 1. clone：要帶 --recurse-submodules，ppt-master 才會一起下來
#    放短路徑：ppt-master 轉檔的暫存資料夾很深，Windows 路徑超過 260 字元會失敗
cd ~/projects
gh repo clone shaun0457/deck-factory -- --recurse-submodules
cd deck-factory
# 已經 clone 但忘了帶參數（pptx/vendor/ppt-master 是空的）：
#   git submodule update --init

# 2. open-slide
pnpm install

# 3. ppt-master 的 Python 環境（.venv 不進版控，每台電腦各建一次）
py -3.12 -m venv .venv                     # macOS/Linux：python3.12 -m venv .venv
.venv/Scripts/python -m pip install -r pptx/vendor/ppt-master/requirements.txt

# 4. 確認裝好了
S=.claude/skills/deck-studio/scripts
pnpm build                                              # open-slide 能 build
node $S/pptx.mjs new setup-check --template tech-talk   # 用範本建一個測試專案
node $S/pptx.mjs build pptx/projects/setup-check_*      # 最後一行印出 pptx: <路徑>
node $S/pptx.mjs render <上一步的 pptx 路徑> --out setup-check-shots   # 只在有 PowerPoint 的 Windows
rm -rf pptx/projects/setup-check_* setup-check-shots    # 刪掉測試專案和截圖
```

4 的 build 要看到 6 頁 `[OK]` 和 `POSTFLIGHT status=passed`；render 要在輸出資料夾看到 `slide01.png`～`slide06.png`，和 `pptx/templates/tech-talk/baseline/` 長得一樣。

之後要做簡報時，在這個 repo 的根目錄開 Claude Code，deck-studio skill 才會載入。

### 之後同步

```bash
git pull --recurse-submodules        # 連 ppt-master 的版本一起更新
pnpm install                         # package.json 有變時
```

ppt-master 的版本有升級時（`pptx/vendor/ppt-master` 改了），重跑 3 的 pip install。

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
