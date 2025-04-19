-- Supabaseユーザーテーブルの作成
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  avatar_type TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLSポリシーの設定
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のデータのみ読み取り可能
CREATE POLICY "users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- ユーザー自身のデータのみ更新可能
CREATE POLICY "users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 新規ユーザー登録時のみ挿入可能
CREATE POLICY "users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 特権ユーザー向けのポリシー（オプション）
-- CREATE POLICY "service_role can do all" ON public.users
--   USING (auth.role() = 'service_role');

-- サインアップ時に自動的にユーザーレコードを作成するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (NEW.id, NEW.email, 'New User');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーを設定（新規ユーザー登録時に実行）
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 