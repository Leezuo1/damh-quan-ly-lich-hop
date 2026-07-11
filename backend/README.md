# Backend - Quản Lý Lịch Họp

NestJS + MongoDB (Mongoose). Toàn bộ API có prefix `/api`.

## Chạy dự án

```bash
npm install
cp .env.example .env   # sửa MONGODB_URI nếu cần
npm run seed            # tạo user/phòng mẫu
npm run start:dev       # http://localhost:3001/api
```

Tài khoản mẫu sau khi seed: `vu.nguyen@company.vn` / `123456` (xem thêm trong `src/seed.ts`).

## Xác thực

Sau khi login, đính token vào mọi request (trừ `/api/auth/login`):

```
Authorization: Bearer <accessToken>
```

---

## Auth

### `POST /api/auth/login`
Request:
```json
{ "email": "vu.nguyen@company.vn", "password": "123456" }
```
Response `200`:
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Nguyễn Văn A", "email": "...", "position": "Nhân viên", "role": "employee" }
}
```
Lỗi `401` nếu sai tài khoản/mật khẩu.

---

## Users

Tất cả yêu cầu Bearer token.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/users/me` | Thông tin cá nhân |
| PATCH | `/api/users/me` | Cập nhật tên/chức danh — body: `{ "name"?, "position"? }` |
| PATCH | `/api/users/me/password` | Đổi mật khẩu — body: `{ "currentPassword", "newPassword" }` |
| GET | `/api/users?q=<keyword>` | Tìm người để mời họp (theo tên/email), tự loại trừ bản thân |

---

## Rooms

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/rooms` | Danh sách phòng |
| GET | `/api/rooms?startTime=<ISO>&endTime=<ISO>` | Danh sách phòng kèm `available: boolean` trong khung giờ đó |
| POST | `/api/rooms` | Tạo phòng — body: `{ "name", "capacity", "floor"?, "equipment"? }` |

Response item:
```json
{ "id": "...", "name": "Phòng họp A", "capacity": 20, "floor": "Tầng 5", "equipment": ["Máy chiếu"], "available": true }
```

---

## Meetings

### `POST /api/meetings` — Tạo lịch họp (khớp modal "Tạo lịch họp mới")
Request:
```json
{
  "title": "Sprint Planning Q3",
  "description": "...",
  "startTime": "2026-06-15T09:00:00.000Z",
  "endTime": "2026-06-15T10:00:00.000Z",
  "roomId": "<room _id>",
  "participantIds": ["<user _id>", "<user _id>"],
  "isImportant": false,
  "onlineLink": "https://...",
  "force": false
}
```
- Nếu **không** trùng lịch: trả `201` + object meeting.
- Nếu **trùng lịch** và `force` không phải `true`: trả `409 Conflict`, body chính là báo cáo xung đột — FE hiển thị modal "Phát hiện xung đột lịch" rồi gọi lại với `force: true` nếu người dùng bấm "Vẫn tạo":
```json
{
  "hasConflict": true,
  "room": { "meetingId": "...", "meetingTitle": "Daily Standup", "startTime": "...", "endTime": "..." },
  "participants": [
    { "userId": "...", "name": "Lê C", "meetingId": "...", "meetingTitle": "..." }
  ]
}
```
`room` chỉ xuất hiện nếu phòng bị trùng; `participants` là mảng rỗng nếu không ai bận.

### `GET /api/meetings?from=<ISO>&to=<ISO>&roomId=&organizerId=&mine=true`
Lọc theo khoảng thời gian hiển thị (dùng cho lịch ngày/tuần/tháng), theo phòng, theo người tổ chức, hoặc chỉ lịch của tôi.

### `GET /api/meetings/mine`
Toàn bộ cuộc họp mà tôi tổ chức hoặc được mời — dùng cho trang "Cuộc họp của tôi". FE tự chia tab dựa trên `status` (`scheduled`/`cancelled`) và so sánh `endTime` với thời gian hiện tại để phân Sắp diễn ra/Đã diễn ra.

### `GET /api/meetings/:id`
Chi tiết 1 cuộc họp (dùng cho trang "Lời mời họp").

### `PATCH /api/meetings/:id`
Chỉ người tổ chức được sửa. Body giống `POST`, các field đều optional, hỗ trợ `force` như trên. Trả `409` tương tự nếu trùng lịch.

### `DELETE /api/meetings/:id`
Hủy cuộc họp (soft-cancel, set `status = cancelled`), chỉ người tổ chức. Trả về meeting đã cập nhật.

### `PATCH /api/meetings/:id/restore`
Khôi phục cuộc họp đã hủy (nút "Khôi phục" ở tab Đã hủy), chỉ người tổ chức.

### `PATCH /api/meetings/:id/respond`
Người được mời chấp nhận/từ chối. Body:
```json
{ "status": "accepted" }
```
(`status` là `"accepted"` hoặc `"declined"`)

### Response shape của 1 meeting
```json
{
  "id": "...",
  "title": "Sprint Planning Q3",
  "description": "...",
  "startTime": "2026-06-15T09:00:00.000Z",
  "endTime": "2026-06-15T10:00:00.000Z",
  "status": "scheduled",
  "isImportant": false,
  "onlineLink": "https://...",
  "room": { "id": "...", "name": "Phòng họp A", "floor": "Tầng 5" },
  "organizer": { "id": "...", "name": "Nguyễn Văn A", "position": "Nhân viên" },
  "participants": [
    { "userId": "...", "name": "Trần B", "position": "Engineer", "status": "pending", "respondedAt": null }
  ]
}
```

---

## Notifications

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/notifications` | Danh sách thông báo của tôi, mới nhất trước |
| GET | `/api/notifications/unread-count` | Số thông báo chưa đọc (badge đỏ trên sidebar) |
| PATCH | `/api/notifications/:id/read` | Đánh dấu 1 thông báo đã đọc |
| PATCH | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc |

`type` có 4 giá trị: `invite` (mời họp), `reminder` (nhắc trước 15 phút, tự động sinh mỗi phút), `response` (ai đó đã chấp nhận/từ chối), `update` (lịch bị sửa/hủy).

Lưu ý: hành động "Chấp nhận/Từ chối" trong trung tâm thông báo gọi `PATCH /api/meetings/:id/respond`, không có endpoint riêng trong Notifications.

---

## Lỗi chung

Mọi lỗi trả về dạng:
```json
{ "statusCode": 400, "message": "...", "error": "Bad Request" }
```
