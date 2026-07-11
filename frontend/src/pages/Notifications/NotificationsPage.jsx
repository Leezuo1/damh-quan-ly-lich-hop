import { useMemo, useState } from "react";
import { AppSidebar } from "../../layouts/AppLayout/AppSidebar";
import { InvitationModal } from "./components/InvitationModal";
import { Bell, Check, AlertTriangle, UserPlus, Settings, Search } from "lucide-react";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "../../hooks/useNotifications";
import { formatRelativeTime, formatTime, formatVNDate } from "../../utils/formatters";

const tabs = ["Tất cả", "Chưa đọc", "Lời mời", "Lịch họp"];

const TYPE_META = {
  invite: { icon: UserPlus, bg: "bg-[#d6f0df]", color: "text-[#22b573]" },
  reminder: { icon: AlertTriangle, bg: "bg-amber-100", color: "text-amber-600" },
  response: { icon: Check, bg: "bg-[#d6f0df]", color: "text-[#22b573]" },
  update: { icon: Settings, bg: "bg-neutral-100", color: "text-neutral-600" },
};

function matchesTab(notification, tab) {
  if (tab === "Tất cả") return true;
  if (tab === "Chưa đọc") return !notification.isRead;
  if (tab === "Lời mời") return notification.type === "invite";
  if (tab === "Lịch họp") return ["reminder", "update", "response"].includes(notification.type);
  return true;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState("Tất cả");
  const [keyword, setKeyword] = useState("");
  const [inviteMeetingId, setInviteMeetingId] = useState(null);

  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = unreadData?.count ?? 0;

  const filtered = useMemo(
    () =>
      notifications.filter(
        (n) => matchesTab(n, tab) && n.message.toLowerCase().includes(keyword.toLowerCase()),
      ),
    [notifications, tab, keyword],
  );

  function openInvite(notification) {
    if (!notification.isRead) markRead.mutate(notification.id);
    setInviteMeetingId(notification.meeting?._id);
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <AppSidebar active="thong-bao" />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-6 py-4">
          <Bell className="h-5 w-5 text-neutral-700" />
          <h1 className="text-lg font-bold text-neutral-900">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#22b573] px-1.5 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
          <div className="ml-auto relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm thông báo..."
              className="w-64 rounded-md border border-neutral-200 pl-8 pr-3 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-neutral-200">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm ${tab === t
                  ? "bg-[#22b573] text-white font-semibold"
                  : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className="text-sm font-medium text-[#22b573] hover:underline disabled:opacity-40"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {!isLoading && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-neutral-400">Không có thông báo nào.</p>
          )}
          {filtered.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.update;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${n.isRead ? "bg-white border-neutral-200" : "bg-[#f3fbf6] border-[#c6ebd3]"}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${meta.bg}`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{n.message}</p>
                  {n.meeting && (
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {n.meeting.title} · {formatVNDate(n.meeting.startTime)} {formatTime(n.meeting.startTime)}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    {n.type === "invite" && (
                      <button
                        onClick={() => openInvite(n)}
                        className="rounded-md bg-[#22b573] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Xem chi tiết
                      </button>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markRead.mutate(n.id)}
                        className="rounded-md border border-neutral-200 px-3 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-xs text-neutral-400 shrink-0">{formatRelativeTime(n.createdAt)}</span>
              </div>
            );
          })}

          {!isLoading && filtered.length > 0 && (
            <p className="text-center text-xs text-neutral-400 mt-4">
              ••• Hiển thị {filtered.length} / {notifications.length} thông báo
            </p>
          )}
        </div>
      </main>
      <InvitationModal
        open={!!inviteMeetingId}
        onClose={() => setInviteMeetingId(null)}
        meetingId={inviteMeetingId}
      />
    </div>
  );
}
