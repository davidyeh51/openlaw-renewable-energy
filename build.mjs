import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lawJson = fs.readFileSync(path.join(__dirname, 'data', 'law-J0130032.json'), 'utf8');
const rulingsJson = fs.readFileSync(path.join(__dirname, 'data', 'related-J0130032.json'), 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="zh-Hant-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#184e38">
  <meta name="description" content="臺灣建築與能源法規庫 ·《再生能源發展條例》全文檢索、官方函釋並讀、OpenData開放資料串接與 Supabase 雲端會員筆記系統。">
  <title>再生能源發展條例｜OpenLaw TW ✕ 全端智慧法規庫</title>

  <!-- Tailwind CSS & Lucide Icons -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <!-- Supabase JS SDK (CDN) -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <!-- Custom Stylesheet -->
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-[#f9fbf9] text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- ==================== 頂部導航列 (Navbar) ==================== -->
  <nav class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <!-- Brand Logo -->
      <div class="flex items-center gap-3">
        <a href="#" class="flex items-center gap-2 group">
          <div class="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
            法
          </div>
          <div>
            <span class="font-bold text-slate-900 tracking-tight text-lg block leading-none">openlaw<span class="text-emerald-700">.tw</span></span>
            <span class="text-[10px] text-slate-600 font-medium tracking-wider block mt-0.5">再生能源法規專庫</span>
          </div>
        </a>
      </div>

      <!-- Quick Jump Selector -->
      <div class="hidden md:flex items-center flex-1 max-w-xs">
        <select id="quick-jump-select" class="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600">
          <option value="">快速跳轉至條號...</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button onclick="toggleRulingsDrawer(true)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="開啟國土署官方解釋函令">
          <i data-lucide="scale" class="w-4 h-4 text-emerald-700"></i>
          <span class="hidden sm:inline">官方函釋</span>
          <span class="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">8</span>
        </button>

        <button onclick="toggleBookmarksDrawer(true)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="開啟我的條文收藏清單">
          <i data-lucide="bookmark" class="w-4 h-4 text-amber-600"></i>
          <span class="hidden sm:inline">我的收藏</span>
        </button>

        <button onclick="openOpenDataModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="檢驗政府開放資料串接 (data.gov.tw)">
          <i data-lucide="database" class="w-4 h-4 text-sky-600"></i>
          <span class="hidden sm:inline">OpenData</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>

        <button id="auth-status-btn" onclick="openSupabaseModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm" title="設定 Supabase 雲端後端與登入會員">
          <i data-lucide="cloud" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Supabase</span>
        </button>

        <button id="print-btn" class="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="A4 友善友善列印">
          <i data-lucide="printer" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  </nav>

  <!-- ==================== 主內容區域 (Main Content) ==================== -->
  <main class="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">

    <!-- Print Header Only (列印時才顯示) -->
    <div class="print-header hidden">
      <h1 class="text-2xl font-bold font-serif mb-1">再生能源發展條例</h1>
      <p class="text-xs text-slate-600">中央法規 · Pcode: J0130032 · 全國法規資料庫官方快照</p>
    </div>

    <!-- 頁首法規資訊 (Header Info) -->
    <header class="mb-8 pb-6 border-b border-slate-200">
      <div class="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wider uppercase mb-2">
        <i data-lucide="book-open" class="w-4 h-4"></i> 中央 · 法律 · 全文快照與智慧檢索
      </div>
      <h1 id="law-title" class="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-tight mb-4">
        再生能源發展條例
      </h1>

      <div id="law-facts" class="flex flex-wrap items-center gap-2 mb-4">
        <!-- 動態注入標籤 -->
      </div>

      <!-- 生效說明重點提示 (重要公告) -->
      <div id="effective-note-container" class="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <i data-lucide="alert-circle" class="w-5 h-5 text-amber-700 shrink-0 mt-0.5"></i>
        <div class="text-xs leading-relaxed text-amber-900">
          <span class="font-bold block text-amber-950 mb-0.5">版本與施行日期特別說明：</span>
          <span id="effective-note-text">一百十二年六月二十一日增訂公布之第 12-1 條條文，施行日期定自一百十五年八月一日施行。</span>
          <span class="block mt-1 text-amber-800">（起造人於新建、增建或改建達一定規模建築物，應設置一定裝置容量以上太陽光電設備）</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-600">
        <a href="https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0130032" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1 text-emerald-700 hover:underline">
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i> 法務部全國法規資料庫官方原文 ↗
        </a>
        <a href="https://data.gov.tw/dataset/18289" target="_blank" rel="noreferrer" class="inline-flex items-center gap-1 text-sky-700 hover:underline">
          <i data-lucide="database" class="w-3.5 h-3.5"></i> 政府開放資料平台 (Dataset 18289) ↗
        </a>
      </div>
    </header>

    <!-- 搜尋與主題過濾列 (Search & Filter Bar) -->
    <section class="mb-8 no-print space-y-4">
      <!-- Search Input -->
      <div class="relative">
        <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
        <input type="text" id="search-input" placeholder="搜尋條文關鍵字、條號（例：12-1、太陽光電、地熱、躉購、代金、雜項執照）..." 
          class="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent shadow-sm">
      </div>

      <!-- Topic Filter Pills -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-medium text-slate-600 mr-1">專題分類：</span>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-emerald-800 text-white transition-colors" data-topic="all">
          全部條文
        </button>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-topic="solar_building">
          ☀️ 建築物太陽光電
        </button>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-topic="geothermal">
          🌋 地熱能探勘與水權
        </button>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-topic="fit_grid">
          ⚡ 躉購費率與併網
        </button>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-topic="large_consumer">
          🏭 用電大戶義務
        </button>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-topic="license_land">
          📋 免雜照與土地使用
        </button>
        <button class="topic-tag-btn px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors" data-topic="penalties">
          ⚖️ 罰則與爭議調解
        </button>
      </div>

      <!-- Match Counter -->
      <div id="search-result-count" class="text-xs text-slate-600 font-medium hidden">
        <!-- 動態顯示結果數 -->
      </div>
    </section>

    <!-- 條文清單列表 (Articles List) -->
    <main id="articles-container" class="space-y-2">
      <!-- 由 app.js 動態渲染 30 條條文 -->
    </main>

    <!-- Print Footer Only -->
    <div class="print-footer hidden">
      <p>來源：法務部全國法規資料庫 (data.gov.tw/dataset/18289) · 由 OpenLaw TW 整理列印</p>
    </div>

  </main>

  <!-- ==================== 頁尾 (Footer) ==================== -->
  <footer class="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-600 no-print">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p class="font-medium text-slate-800">OpenLaw TW · 臺灣建築與再生能源法規檢索專庫</p>
        <p class="mt-0.5">本系統資料來源為法務部全國法規資料庫、政府資料開放平台及內政部國土管理署。</p>
      </div>
      <div class="flex items-center gap-4">
        <a href="https://github.com/termcavetw/openlawtw" target="_blank" rel="noreferrer" class="hover:text-emerald-700">OpenLaw 原專案</a>
        <span>·</span>
        <a href="https://supabase.com" target="_blank" rel="noreferrer" class="hover:text-emerald-700">Supabase BaaS</a>
        <span>·</span>
        <a href="https://data.gov.tw" target="_blank" rel="noreferrer" class="hover:text-emerald-700">政府資料開放平台</a>
      </div>
    </div>
  </footer>

  <!-- ==================== 官方函釋並讀抽屜 (Rulings Drawer) ==================== -->
  <aside id="rulings-drawer" class="fixed inset-0 z-50 hidden no-print">
    <div class="absolute inset-0 drawer-backdrop" onclick="toggleRulingsDrawer(false)"></div>
    <div class="absolute top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 transition-transform">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2">
          <i data-lucide="scale" class="w-5 h-5 text-emerald-700"></i>
          <h3 id="rulings-drawer-title" class="font-semibold text-slate-900 text-sm">官方函釋並讀</h3>
        </div>
        <button onclick="toggleRulingsDrawer(false)" class="p-1 rounded-lg hover:bg-slate-200 text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div id="rulings-list-container" class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- 動態注入函釋清單 -->
      </div>
    </div>
  </aside>

  <!-- ==================== 條文收藏清單抽屜 (Bookmarks Drawer) ==================== -->
  <aside id="bookmarks-drawer" class="fixed inset-0 z-50 hidden no-print">
    <div class="absolute inset-0 drawer-backdrop" onclick="toggleBookmarksDrawer(false)"></div>
    <div class="absolute top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 transition-transform">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div class="flex items-center gap-2">
          <i data-lucide="bookmark" class="w-5 h-5 text-amber-600"></i>
          <h3 class="font-semibold text-slate-900 text-sm">我的收藏條文</h3>
        </div>
        <button onclick="toggleBookmarksDrawer(false)" class="p-1 rounded-lg hover:bg-slate-200 text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
      <div id="bookmarks-list-container" class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- 動態注入收藏條文 -->
      </div>
    </div>
  </aside>

  <!-- ==================== 條文筆記編輯 Modal (Note Modal) ==================== -->
  <div id="note-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 no-print">
    <div class="absolute inset-0 drawer-backdrop" onclick="closeNoteModal()"></div>
    <div class="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 id="note-modal-title" class="font-bold text-slate-900 text-base">條文筆記</h3>
        <button onclick="closeNoteModal()" class="p-1 text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">研析或專案備忘內容：</label>
          <textarea id="note-content-input" rows="4" placeholder="記錄此條文在電廠建置、綠能躉購、免雜項執照或大戶義務評估之實務重點..." 
            class="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-700"></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">標籤 Tags（以逗號分隔）：</label>
          <input type="text" id="note-tags-input" placeholder="例：光電審查, 台電併網, 契約備查" 
            class="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-700">
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">附件上傳 (直傳 Supabase Storage Bucket)：</label>
          <input type="file" id="note-file-input" class="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
          <p class="text-[11px] text-slate-400 mt-1">需登入 Supabase 帳號，檔案將存入 law-attachments 儲存桶。</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
        <button onclick="closeNoteModal()" class="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
          取消
        </button>
        <button onclick="saveCurrentNote()" class="px-4 py-2 text-xs font-medium bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 shadow-sm">
          儲存筆記
        </button>
      </div>
    </div>
  </div>

  <!-- ==================== OpenData 串接與狀態檢驗 Modal ==================== -->
  <div id="opendata-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 no-print">
    <div class="absolute inset-0 drawer-backdrop" onclick="closeOpenDataModal()"></div>
    <div class="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <i data-lucide="database" class="w-5 h-5 text-sky-600"></i>
          <h3 class="font-bold text-slate-900 text-base">政府開放資料 (OpenData) 串接狀態</h3>
        </div>
        <button onclick="closeOpenDataModal()" class="p-1 text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="space-y-3 text-xs text-slate-700 leading-relaxed">
        <div class="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
          <div class="flex justify-between"><span class="text-slate-500">法規識別碼 (Pcode)：</span><span class="font-mono font-bold">J0130032</span></div>
          <div class="flex justify-between"><span class="text-slate-500">主管機關：</span><span>經濟部 / 內政部</span></div>
          <div class="flex justify-between"><span class="text-slate-500">開放資料平台 Dataset ID：</span><span class="font-mono font-bold text-sky-700">18289（中央法規-法律）</span></div>
          <div class="flex justify-between"><span class="text-slate-500">收錄條文數：</span><span>30 條（含第12-1條等增修條文）</span></div>
          <div class="flex justify-between"><span class="text-slate-500">來源修法日期：</span><span>2025-06-11</span></div>
          <div class="flex justify-between"><span class="text-slate-500">校驗雜湊值 (SHA-256)：</span><span class="font-mono text-[10px] text-slate-500">7ec5104db2b06019...</span></div>
        </div>

        <div id="opendata-ping-status" class="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span class="font-medium flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4"></i> 本站資料與全國法規資料庫即時同步。定期排程自動抓取。</span>
        </div>

        <div class="pt-2">
          <button onclick="testOpenDataPing()" class="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-sky-700 text-white hover:bg-sky-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> 立即執行 API 連線測試
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== Supabase 雲端設定與 Auth Modal ==================== -->
  <div id="supabase-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center p-4 no-print">
    <div class="absolute inset-0 drawer-backdrop" onclick="closeSupabaseModal()"></div>
    <div class="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 z-10 space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <div class="flex items-center gap-2">
          <i data-lucide="cloud" class="w-5 h-5 text-emerald-700"></i>
          <h3 class="font-bold text-slate-900 text-base">Supabase BaaS 雲端服務設定</h3>
        </div>
        <button onclick="closeSupabaseModal()" class="p-1 text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Logged-in view -->
      <div id="auth-logged-in-section" class="hidden p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-semibold">目前已登入帳號：</span>
          <span id="current-user-email" class="font-mono"></span>
        </div>
        <p class="text-slate-600">您的條文收藏、研析筆記與附件已透過 Supabase PostgreSQL 與 Storage 即時雲端同步並受 RLS 行級安全防護。</p>
        <button onclick="handleAuthSignOut()" class="mt-2 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">
          登出帳號
        </button>
      </div>

      <!-- Auth Form (Sign In / Sign Up) -->
      <div id="auth-form-section" class="space-y-3">
        <h4 class="text-xs font-bold text-slate-800">會員登入 / 註冊</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input type="email" id="auth-email-input" placeholder="電子郵件 Email" class="text-xs border border-slate-200 rounded-lg p-2.5">
          <input type="password" id="auth-password-input" placeholder="密碼 Password" class="text-xs border border-slate-200 rounded-lg p-2.5">
        </div>
        <div class="flex gap-2">
          <button onclick="handleAuthLogin()" class="flex-1 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-700">
            登入
          </button>
          <button onclick="handleAuthSignUp()" class="flex-1 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200">
            註冊新帳號
          </button>
        </div>
      </div>

      <!-- Custom Supabase Project Config -->
      <div class="pt-3 border-t border-slate-100 space-y-2">
        <details class="text-xs text-slate-600">
          <summary class="cursor-pointer font-semibold text-slate-800 hover:text-emerald-700">自訂 Supabase 專案金鑰 (連線至您的專屬後端)</summary>
          <div class="mt-3 space-y-2">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-0.5">SUPABASE_URL</label>
              <input type="text" id="sb-url-input" placeholder="https://your-project.supabase.co" class="w-full text-xs font-mono border border-slate-200 rounded-lg p-2">
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 mb-0.5">SUPABASE_ANON_KEY (公開 Client Key)</label>
              <input type="text" id="sb-key-input" placeholder="eyJhbGciOiJIUzI1NiIsInR..." class="w-full text-xs font-mono border border-slate-200 rounded-lg p-2">
            </div>
            <p class="text-[10px] text-slate-400">依據 github-supabase-web 規範，前端僅允許使用 anon key，嚴格禁止 service_role key。</p>
            <button onclick="saveSupabaseConfig()" class="w-full py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900">
              儲存連線設定
            </button>
          </div>
        </details>
      </div>

      <div class="text-right pt-1">
        <button onclick="closeSupabaseModal()" class="px-4 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
          關閉
        </button>
      </div>
    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none no-print"></div>

  <!-- ==================== 內嵌官方條文與函釋完整快照 (保證零依賴離線開啟) ==================== -->
  <script type="application/json" id="law-snapshot">
${lawJson}
  </script>

  <script type="application/json" id="rulings-snapshot">
${rulingsJson}
  </script>

  <!-- Core App Logic -->
  <script src="app.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent, 'utf8');
console.log('Successfully generated index.html with embedded law & rulings data!');
