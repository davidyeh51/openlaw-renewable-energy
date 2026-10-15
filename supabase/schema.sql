-- ==============================================================================
-- GitHub ✕ Supabase 臺灣建築與能源法規庫 (OpenLaw Renewable Energy) 後端架構
-- 依據 github-supabase-web 規範設計：純前端託管、公開 Anon Key、嚴格啟用 RLS 行級安全
-- ==============================================================================

-- 1. 條文收藏資料表 (law_bookmarks)
CREATE TABLE IF NOT EXISTS public.law_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    law_id TEXT NOT NULL DEFAULT 'J0130032',
    article_no TEXT NOT NULL,
    anchor TEXT NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_law_bookmarks_user_anchor 
    ON public.law_bookmarks (user_id, anchor);

-- 2. 條文專屬筆記與法規研析表 (article_notes)
CREATE TABLE IF NOT EXISTS public.article_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    law_id TEXT NOT NULL DEFAULT 'J0130032',
    article_no TEXT NOT NULL,
    anchor TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_article_notes_user_anchor 
    ON public.article_notes (user_id, anchor);

-- 3. OpenData 政府資料開放平台同步紀錄表 (law_sync_logs)
CREATE TABLE IF NOT EXISTS public.law_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    law_id TEXT NOT NULL,
    law_name TEXT NOT NULL,
    source TEXT NOT NULL,
    version_date TEXT,
    content_hash TEXT,
    total_articles INTEGER,
    status TEXT DEFAULT 'success',
    synced_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_law_sync_logs_law_version 
    ON public.law_sync_logs (law_id, version_date);

-- ==============================================================================
-- 🛡️ 啟用 Row Level Security (RLS) 行級安全控管（防護核心）
-- ==============================================================================

ALTER TABLE public.law_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_sync_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. 權限原則：law_bookmarks (只有作者本人能讀取、新增、修改、刪除)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.law_bookmarks;
CREATE POLICY "Users can view their own bookmarks"
    ON public.law_bookmarks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.law_bookmarks;
CREATE POLICY "Users can create their own bookmarks"
    ON public.law_bookmarks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.law_bookmarks;
CREATE POLICY "Users can update their own bookmarks"
    ON public.law_bookmarks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.law_bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
    ON public.law_bookmarks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. 權限原則：article_notes (只有作者本人能讀取、新增、修改、刪除)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own article notes" ON public.article_notes;
CREATE POLICY "Users can view their own article notes"
    ON public.article_notes FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own article notes" ON public.article_notes;
CREATE POLICY "Users can create their own article notes"
    ON public.article_notes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own article notes" ON public.article_notes;
CREATE POLICY "Users can update their own article notes"
    ON public.article_notes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own article notes" ON public.article_notes;
CREATE POLICY "Users can delete their own article notes"
    ON public.article_notes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. 權限原則：law_sync_logs (所有大眾/訪客皆可公開查閱同步快照，僅認證使用者或管理員能寫入)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view open data sync logs" ON public.law_sync_logs;
CREATE POLICY "Anyone can view open data sync logs"
    ON public.law_sync_logs FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert sync logs" ON public.law_sync_logs;
CREATE POLICY "Authenticated users can insert sync logs"
    ON public.law_sync_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ==============================================================================
-- 📦 7. Supabase Storage 儲存桶自動建立與權限控管 (law-attachments)
-- ==============================================================================

-- 自動建立/確保 law-attachments 公開儲存桶存在
INSERT INTO storage.buckets (id, name, public)
VALUES ('law-attachments', 'law-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 允許任何人讀取附件檔案 (公開圖檔/文件預覽)
DROP POLICY IF EXISTS "Public Read Access for law-attachments" ON storage.objects;
CREATE POLICY "Public Read Access for law-attachments"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'law-attachments');

-- 僅允許已登入的使用者上傳檔案至自己的路徑 uploads/{user_id}/*
DROP POLICY IF EXISTS "Authenticated users can upload law attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload law attachments"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'law-attachments' AND
        (storage.foldername(name))[1] = 'uploads' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- 僅允許使用者更新自己的檔案
DROP POLICY IF EXISTS "Users can update own law attachments" ON storage.objects;
CREATE POLICY "Users can update own law attachments"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'law-attachments' AND
        (storage.foldername(name))[1] = 'uploads' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- 僅允許使用者刪除自己的檔案
DROP POLICY IF EXISTS "Users can delete own law attachments" ON storage.objects;
CREATE POLICY "Users can delete own law attachments"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'law-attachments' AND
        (storage.foldername(name))[1] = 'uploads' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- 初始化第 1 筆政府開放資料同步紀錄
INSERT INTO public.law_sync_logs (law_id, law_name, source, version_date, content_hash, total_articles, status)
VALUES (
    'J0130032',
    '再生能源發展條例',
    '全國法規資料庫 (data.gov.tw/dataset/18289)',
    '2025-06-11',
    '414e7231da57a15b01b0c3cfc44b60456de3f6b677692b26e60fbc6fc0020423',
    30,
    'success'
) ON CONFLICT (law_id, version_date) DO NOTHING;
