# 臺灣再生能源法規專庫 (OpenLaw Renewable Energy)

> 本專案為利用 **REA (Reverse Engineer Anything)** 逆向工程解析 [openlawtw](https://openlawtw.vercel.app/laws/J0130032.html) 之《再生能源發展條例》，重新規劃設計並整合 **GitHub Pages 靜態前端託管**、**Supabase BaaS 雲端後端（Auth、Database、Storage、RLS）** 與 **政府開放資料平台 (data.gov.tw / moj.gov.tw) OpenData 串接** 的全端現代化法規知識庫系統。

---

## 🌟 核心特色與亮點

### 1. 經典法規排版與極致閱讀體驗 (REA 逆向重構)
- **雙欄式自適應排版**：條號在左、條文在右，手機自動切換單欄堆疊與大點按區塊。
- **即時全文檢索與高亮**：支援條號（如 `12-1`、`第12條`）、關鍵字（`太陽光電`、`地熱`、`躉購`、`代金`、`免雜照`）即時篩選與黃底標記。
- **法規專題一鍵過濾**：
  - ☀️ 建築物太陽光電（第 12、12-1、13、17 條）
  - 🌋 地熱能探勘與水權（第 15-1～15-5、20-1 條）
  - ⚡ 躉購費率與併網（第 4、8、9、10 條）
  - 🏭 用電大戶義務與代金（第 7、12 條）
  - 📋 免雜照與土地使用（第 14、15、17 條）
  - ⚖️ 罰則與爭議調解（第 18～22 條）
- **官方函釋並讀側欄**：收錄內政部國土管理署（原營建署）8 則重大函釋（如漁電共生、小型風機雜照、農舍太陽能、立體停車場光電疑義等）。
- **關鍵法規生效特別公告**：特別醒目標示 **第 12-1 條**（起造人達一定規模新建/增建/改建應設置一定容量太陽光電設備）**定自民國 115 年 8 月 1 日正式施行**。
- **A4 友善列印優化**：隱藏所有控制按鈕，自動適應 A4 直式輸出法條本文與版權標註。

---

### 2. 政府開放資料 OpenData 串接 (data.gov.tw ✕ moj.gov.tw)
- **資料集對應**：
  - 平台：政府資料開放平台 (data.gov.tw)
  - 資料集 ID：`18289`（全國法規資料庫 - 中央法律）
  - 法規代碼 (Pcode)：`J0130032`
- **本地同步腳本**：提供 `sync-opendata.mjs`，即時抓取並計算 SHA-256 數位指紋。
- **GitHub Actions 自動化排程**：內建 `.github/workflows/opendata-sync.yml`，每週一自動檢查法規修法更新並推送 Commit。
- **前端即時檢驗視窗**：點擊導航列「OpenData」即可檢視目前資料雜湊、修正日期並在線執行端點存活性測試。

---

### 3. Supabase BaaS 全端雲端整合 (依據 `github-supabase-web` 安全規範)
- **零私鑰外洩守則**：前端代碼完全公開透明，**僅允許使用 `anon key`（公開 Client Key）**，絕無任何 `service_role key`。
- **完整 RLS 行級安全策略**：所有資料表強制啟用 `ROW LEVEL SECURITY`，只有通過認證的本人帳號才能讀寫專屬資料。
- **核心功能**：
  - 🔐 **Auth 身分驗證**：支援 Email / 密碼登入與註冊、Session 狀態維持。
  - 💾 **PostgreSQL 資料庫**：
    - `law_bookmarks`：條文收藏清單。
    - `article_notes`：個人專屬實務筆記、案件分析、專案標籤（Tags）。
    - `law_sync_logs`：法規 OpenData 歷次同步紀錄與版本雜湊（公開讀取）。
  - 📁 **Storage 雲端檔案儲存**：
    - `law-attachments` 儲存桶：上傳審查文件、現場勘查相片、圖說 PDF，限制僅上傳者本人有修改權限。
- **靈活配置與本地降級機制**：具備視覺化 Supabase 連線設定視窗；若尚未配置 Supabase 專案，系統自動無縫降級至 `localStorage` 本地儲存，使用者仍可正常收藏與記錄筆記。

---

## 🚀 快速上手與部署至 GitHub Pages

### 步驟 1：建立 GitHub 倉庫並推送代碼
在終端機執行下列指令：
```bash
cd openlaw-renewable-energy
git init
git add .
git commit -m "feat: initial commit of openlaw renewable energy platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/openlaw-renewable-energy.git
git push -u origin main
```

### 步驟 2：啟用 GitHub Pages（推播即上線）
1. 進入您的 GitHub 倉庫頁面，點選 **Settings**。
2. 左側選單點選 **Pages**。
3. 在 **Build and deployment** 下方的 **Source** 選擇 `Deploy from a branch`。
4. Branch 選擇 `main`，資料夾選擇 `/ (root)`，點選 **Save**。
5. 等待 1~2 分鐘，即可在 `https://YOUR_USERNAME.github.io/openlaw-renewable-energy/` 瀏覽網站！

---

### 步驟 3：設定 Supabase 後端資料庫與 Storage

1. 前往 [Supabase 官網](https://supabase.com) 註冊並建立一個新專案（Project）。
2. 在左側選單進入 **SQL Editor**。
3. 開啟本專案的 `supabase/schema.sql`，將內容全部複製並貼入 Supabase SQL Editor 中執行（Run）。
4. 在左側選單進入 **Storage**：
   - 點選 **New bucket**，輸入名稱 `law-attachments`。
   - 將 Bucket 設定為 **Public bucket**，然後點選儲存。
5. 在左側選單進入 **Project Settings** -> **API**：
   - 複製 **Project URL** 與 **Project API keys (anon / public)**。
6. 打開您的網頁，點選右上角 **Supabase** 按鈕，在「自訂 Supabase 專案金鑰」填入您的 URL 與 Anon Key 即完成綁定！

---

## 📂 專案檔案結構

```
openlaw-renewable-energy/
├── .github/
│   └── workflows/
│       └── opendata-sync.yml      # GitHub Actions 每週定時 OpenData 同步工作流
├── data/
│   ├── law-J0130032.json          # 《再生能源發展條例》30 條全文結構化資料
│   ├── related-J0130032.json      # 內政部國土管理署 8 則官方解釋函令
│   └── opendata-sync-report.json  # OpenData 同步檢核報告與 SHA-256 摘要
├── supabase/
│   └── schema.sql                 # Supabase 完整 DDL、RLS 行級安全與 Storage 權限腳本
├── app.js                         # 前端核心邏輯（檢索、跳轉、函釋、Supabase 串接）
├── build.mjs                      # 零依賴打包建構腳本
├── index.html                     # 主入口靜態網頁（內嵌完整資料快照，支援離線閱讀）
├── style.css                      # 專屬法規閱讀排版樣式與 A4 列印規則
├── sync-opendata.mjs              # 串接政府開放平台 (data.gov.tw) 與法務部 API 同步腳本
└── README.md                      # 本專案完整說明文件
```

---

## 📜 資料來源與權利說明

- 法規文字來源：[法務部全國法規資料庫](https://law.moj.gov.tw/) 及 [政府資料開放平台](https://data.gov.tw/dataset/18289)
- 函釋文字來源：[內政部國土管理署建築管理組解釋函令資料庫](https://www.nlma.gov.tw/ch/titlelist/interpcomp)
- 原始專案參考：[termcavetw/openlawtw](https://github.com/termcavetw/openlawtw) (MIT License)
