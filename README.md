# English Bot Quiz

Web app luyện từ vựng từ Google Sheet cố định.

## Tính năng

1. Tạo quiz ngẫu nhiên từ file sheet (chọn số từ mỗi lần làm).
2. Snapshot 1h sáng mỗi ngày (GitHub Actions): lưu trạng thái từ vựng vào `data/word-snapshot.json`.
3. Job 7h sáng mỗi ngày (GitHub Actions): lấy từ mới sau snapshot, tạo bài quiz, gửi email.
4. Link trong email mở thẳng trang làm bài theo ngày: `/daily-quiz/YYYY-MM-DD`, làm xong chấm điểm ngay trên web.
5. Giao diện nhiều trang theo format dashboard:
   - `/` Tổng quan
   - `/words` Danh sách từ + lọc
   - `/daily` Từ mới so với snapshot
   - `/quiz` Tạo quiz và làm quiz

## Chạy local

```bash
npm install
copy .env.example .env
npm run dev
```

Mở `http://localhost:3000`.

## Cấu hình GitHub Actions secrets

Thêm các secrets trong repo:

- `SHEET_SOURCE_URL` (có thể dùng URL mặc định của bạn)
- `APP_BASE_URL` (URL web public để bấm từ email, ví dụ `https://your-domain.com`)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `QUIZ_EMAIL_TO`

Workflows:
- `.github/workflows/snapshot.yml` (01:00 Asia/Ho_Chi_Minh)
- `.github/workflows/daily-quiz.yml` (07:00 Asia/Ho_Chi_Minh)
