# Deploying LIM Synergy App

Dự án này sử dụng Next.js và Supabase. Dưới đây là hướng dẫn để Thầy tự triển khai (deploy) lên Vercel và hoàn thiện setup Supabase.

## Bước 1: Đẩy code lên GitHub
Thông tin Thầy cung cấp: `[ĐÃ ẨN TOKEN BẢO MẬT]`

Mở Terminal của VSCode tại thư mục `C:\Users\Duong Hieu\.gemini\antigravity\scratch\lim-synergy-app` và chạy các lệnh sau:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Thay bằng tên GitHub của Thầy và tên Repo mong muốn
git remote add origin https://oauth2:<TOKEN_CUA_THAY>@github.com/{GITHUB_USERNAME}/lim-synergy-app.git
git push -u origin main
```

## Bước 2: Tạo Bảng trên Supabase
1. Đăng nhập vào Supabase [https://supabase.com/dashboard/project/uccyvfyltcyntbyvngmm](https://supabase.com/dashboard/project/uccyvfyltcyntbyvngmm)
2. Nhấn vào mục **SQL Editor** ở cột bên trái.
3. Tạo một Query mới (New Query).
4. Mở file `supabase/schema.sql` trong dự án này, copy toàn bộ nội dung và paste vào SQL Editor.
5. Nhấn **RUN**.
*(Bước này sẽ tạo ra 5 bảng và tự động bật Realtime cho chúng).*

## Bước 3: Deploy lên Vercel
1. Đăng nhập vào [Vercel](https://vercel.com/) bằng tài khoản GitHub của Thầy.
2. Bấm nút **Add New... -> Project**.
3. Chọn repo `lim-synergy-app` mà Thầy vừa đẩy code lên -> Bấm **Import**.
4. Trong phần cài đặt **Environment Variables**, hãy copy 2 dòng sau vào:

`NEXT_PUBLIC_SUPABASE_URL` = `https://uccyvfyltcyntbyvngmm.supabase.co`
`NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjY3l2ZnlsdGN5bnRieXZuZ21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjI4MDMsImV4cCI6MjA4ODYzODgwM30.s0uKr0x3VGHuQhbV24Rj4iYU2NiEWXqnzXmyD4dlc50`

5. Bấm **Deploy**.
6. Chỉ mất khoảng 1 phút, Vercel sẽ tự build và cung cấp cho Thầy 1 đường link public để sử dụng!
