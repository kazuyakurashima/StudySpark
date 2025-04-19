-- 頻繁にアクセスされるテーブルにインデックスを追加

-- question_attempt_logs テーブルにインデックスを追加
-- ユーザーIDと日付でのフィルタリングが頻繁に行われるため
CREATE INDEX IF NOT EXISTS "question_attempt_logs_user_id_date_idx" ON "question_attempt_logs" ("user_id", "date");

-- ユーザーIDとステータスでのフィルタリングのためのインデックス
CREATE INDEX IF NOT EXISTS "question_attempt_logs_user_id_status_idx" ON "question_attempt_logs" ("user_id", "status");

-- 質問IDと日付でのフィルタリングのためのインデックス
CREATE INDEX IF NOT EXISTS "question_attempt_logs_question_id_date_idx" ON "question_attempt_logs" ("question_id", "date");

-- learning_tasks テーブルにインデックス追加
-- プランIDと日付でのフィルタリングが頻繁に行われるため
CREATE INDEX IF NOT EXISTS "learning_tasks_plan_id_date_idx" ON "learning_tasks" ("plan_id", "date");

-- 日付とreview_dayでのフィルタリングのためのインデックス
CREATE INDEX IF NOT EXISTS "learning_tasks_date_is_review_day_idx" ON "learning_tasks" ("date", "is_review_day");

-- goals テーブルのユーザーIDとテスト日でのフィルタリング
CREATE INDEX IF NOT EXISTS "goals_user_id_test_dates_idx" ON "goals" ("user_id", "test_start_date", "test_end_date");

-- LearningPlan テーブルへのインデックス
CREATE INDEX IF NOT EXISTS "learning_plans_user_id_idx" ON "learning_plans" ("user_id");
CREATE INDEX IF NOT EXISTS "learning_plans_goal_id_idx" ON "learning_plans" ("goal_id");

-- DailyReflection テーブルへのインデックス
CREATE INDEX IF NOT EXISTS "daily_reflections_user_id_date_idx" ON "daily_reflections" ("user_id", "date");

-- WeeklyReflection テーブルへのインデックス
CREATE INDEX IF NOT EXISTS "weekly_reflections_user_id_week_idx" ON "weekly_reflections" ("user_id", "week_start", "week_end");

-- ValuePrompt テーブルへのインデックス
CREATE INDEX IF NOT EXISTS "value_prompts_user_id_type_idx" ON "value_prompts" ("user_id", "prompt_type");

-- ReflectionBadge テーブルへのインデックス
CREATE INDEX IF NOT EXISTS "reflection_badges_user_id_type_idx" ON "reflection_badges" ("user_id", "badge_type"); 