# Routes

Thư mục này chỉ khai báo URL và trỏ đến component tương ứng trong `src/pages`.

- Không đặt giao diện, state hoặc mock data trong `routes`.
- Mỗi route import đúng một page component.
- `__root.jsx` là route gốc của TanStack Router.
- `routeTree.gen.js` là file sinh tự động, không sửa bằng tay.

| File route | Page |
| --- | --- |
| `index.jsx` | `pages/Login/LoginPage.jsx` |
| `calendar.jsx` | `pages/Calendar/CalendarPage.jsx` |
| `rooms.jsx` | `pages/Rooms/RoomsPage.jsx` |
| `my-meetings.jsx` | `pages/MyMeetings/MyMeetingsPage.jsx` |
| `notifications.jsx` | `pages/Notifications/NotificationsPage.jsx` |
| `invitations.jsx` | `pages/Invitations/InvitationsPage.jsx` |
| `profile.jsx` | `pages/Profile/ProfilePage.jsx` |
| `change-password.jsx` | `pages/ChangePassword/ChangePasswordPage.jsx` |
