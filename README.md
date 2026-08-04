# ナミスタ専用シフト管理

ナミスタの時間帯・ポジション別シフト、スタッフ技能、売上目標、人件費率をまとめて管理する専用Webアプリです。

## ローカル起動

Node.js 20.9以降を用意し、プロジェクト直下で実行します。

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。Supabase未設定でもデモモードで全画面と自動編成を確認できます。

## Supabaseの準備

1. Supabaseで新しいプロジェクトを作成します。
2. SQL Editorで `supabase/migrations/001_initial_schema.sql` を実行します。
3. 続けて `supabase/seed.sql` を実行します。
4. `.env.local.example` を `.env.local` にコピーし、Project Settings → APIの値を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

5. Authenticationでログインユーザーを作り、対応する `staff.auth_user_id` にそのUUIDを設定します。

```sql
update public.staff
set auth_user_id = 'AUTH_USER_UUID'
where id = '10000000-0000-0000-0000-000000000002';
```

現プロトタイプは、Supabase AuthへのログインとDBスキーマを実装し、画面データは動作確認しやすいデモデータを使用しています。本番化時は各画面の取得・保存処理をSupabaseクエリへ置き換えてください。

## 主なコマンド

```bash
npm run dev     # 開発サーバー
npm run build   # 本番ビルド検証
npm run start   # 本番サーバー
npm run lint    # ESLint
```
