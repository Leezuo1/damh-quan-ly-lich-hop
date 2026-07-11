import { useMemo, useState } from "react";
import { Pencil, RotateCcw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "../../layouts/AppLayout/AppSidebar";
import { useAuth } from "../../context/AuthContext";
import {
  useCancelMeeting,
  useMyMeetings,
  useRestoreMeeting,
  useUpdateMeeting,
} from "../../hooks/useMeetings";
import {
  ConflictModal,
  CreateMeetingModal,
  SuccessModal,
} from "../Calendar/components/CreateMeetingModal";
import { ApiError } from "../../lib/api";
import { formatTimeRange, formatVNDate } from "../../utils/formatters";

const tabs = [
  { key: "upcoming", label: "Sắp diễn ra" },
  { key: "past", label: "Đã diễn ra" },
  { key: "cancelled", label: "Đã hủy" },
];
const statusBadge = {
  upcoming: "bg-[#d6f0df] text-[#0f5132]",
  past: "bg-neutral-100 text-neutral-500",
  cancelled: "bg-rose-100 text-rose-600",
};
const statusText = {
  upcoming: "Sắp diễn ra",
  past: "Đã diễn ra",
  cancelled: "Đã hủy",
};
const accentBar = {
  upcoming: "bg-[#22b573]",
  past: "bg-neutral-300",
  cancelled: "bg-rose-400",
};
// Tui gom mấy class Tailwind dài ra đây cho dễ nhìn.
const khung_trang = "flex h-screen bg-white";
const noi_dung_chinh = "flex-1 flex flex-col overflow-hidden";
const hang_tieu_de = "flex items-center justify-between px-8 pt-6 pb-4";
const o_tim_kiem = "w-72 rounded-lg border border-neutral-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[#22b573]";
const chu_bang_tieu_de = "text-[11px] uppercase tracking-wide text-neutral-400";
const tab_dang_chon = "border-[#22b573] font-semibold text-[#22b573]";
const tab_binh_thuong = "border-transparent text-neutral-500 hover:text-neutral-800";

// Backend chỉ có status scheduled/cancelled — FE tự chia sắp diễn ra/đã diễn ra
// bằng cách so endTime với thời gian hiện tại (theo README của backend).
function deriveTab(meeting, now) {
  if (meeting.status === "cancelled") return "cancelled";
  return new Date(meeting.endTime) > now ? "upcoming" : "past";
}

export default function MyMeetingsPage() {
  const [tab, setTab] = useState("upcoming");
  const [keyword, setKeyword] = useState("");
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [modal, setModal] = useState(null);
  const [successMeeting, setSuccessMeeting] = useState(null);
  const [conflictInfo, setConflictInfo] = useState(null);

  const { user } = useAuth();
  const { data: meetings = [], isLoading } = useMyMeetings();
  const updateMeeting = useUpdateMeeting();
  const cancelMeeting = useCancelMeeting();
  const restoreMeeting = useRestoreMeeting();
  const submitting = updateMeeting.isPending;

  const now = useMemo(() => new Date(), []);
  const withTab = useMemo(
    () => meetings.map((meeting) => ({ ...meeting, _tab: deriveTab(meeting, now) })),
    [meetings, now],
  );

  const counts = useMemo(() => {
    return {
      upcoming: withTab.filter((m) => m._tab === "upcoming").length,
      past: withTab.filter((m) => m._tab === "past").length,
      cancelled: withTab.filter((m) => m._tab === "cancelled").length,
    };
  }, [withTab]);

  const rows = withTab.filter(
    (meeting) => meeting._tab === tab && meeting.title.toLowerCase().includes(keyword.toLowerCase()),
  );

  function openEdit(meeting) {
    setEditingMeeting(meeting);
    setModal("create");
  }

  function handleSubmit(dto, meetingId) {
    updateMeeting.mutate(
      { id: meetingId, dto },
      {
        onSuccess: (meeting) => {
          setSuccessMeeting(meeting);
          setModal("success");
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setConflictInfo({ report: err.body, dto, meetingId, roomName: undefined });
            setModal("conflict");
          } else {
            toast.error(err.message || "Có lỗi xảy ra, thử lại nhé.");
          }
        },
      },
    );
  }

  function handleForceSubmit() {
    if (!conflictInfo) return;
    const { dto, meetingId } = conflictInfo;
    updateMeeting.mutate(
      { id: meetingId, dto: { ...dto, force: true } },
      {
        onSuccess: (meeting) => {
          setSuccessMeeting(meeting);
          setModal("success");
        },
        onError: (err) => toast.error(err.message || "Có lỗi xảy ra, thử lại nhé."),
      },
    );
  }

  function handleCancel(meeting) {
    if (!window.confirm(`Hủy cuộc họp "${meeting.title}"?`)) return;
    cancelMeeting.mutate(meeting.id, {
      onSuccess: () => toast.success("Đã hủy cuộc họp."),
      onError: (err) => toast.error(err.message || "Không hủy được cuộc họp."),
    });
  }

  function handleRestore(meeting) {
    restoreMeeting.mutate(meeting.id, {
      onSuccess: () => toast.success("Đã khôi phục cuộc họp."),
      onError: (err) => toast.error(err.message || "Không khôi phục được cuộc họp."),
    });
  }

  return (
    <div className={khung_trang}>
      <AppSidebar active="cuoc-hop-cua-toi" />
      <main className={noi_dung_chinh}>
        <div className={hang_tieu_de}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">Cuộc họp của tôi</h1>
            <span className="rounded-full bg-[#d6f0df] px-2.5 py-0.5 text-xs font-semibold text-[#0f5132]">
              {meetings.length} cuộc họp
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên cuộc họp..."
              className={o_tim_kiem}
            />
          </div>
        </div>

        <div className="px-8 border-b border-neutral-200">
          <div className="flex gap-6">
            {tabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`-mb-px flex items-center gap-1.5 border-b-2 pb-3 text-sm ${tab === item.key ? tab_dang_chon : tab_binh_thuong}`}
              >
                {item.label}
                <span className={tab === item.key ? "text-[#22b573]" : "text-neutral-400"}>
                  {counts[item.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 py-4">
          <table className="w-full">
            <thead>
              <tr className={chu_bang_tieu_de}>
                <th className="py-2 pl-4 text-left font-medium">Cuộc họp</th>
                <th className="py-2 text-left font-medium">Thời gian</th>
                <th className="py-2 text-left font-medium">Phòng</th>
                <th className="py-2 text-left font-medium">Trạng thái</th>
                <th className="py-2 pr-2 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((meeting) => {
                const isOrganizer = meeting.organizer?.id === user?.id;
                const canManage = isOrganizer && meeting._tab === "upcoming";
                return (
                  <tr key={meeting.id} className="border-t border-neutral-100 align-middle">
                    <td className="py-4 pl-4">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-10 w-1 rounded-full ${accentBar[meeting._tab]}`} />
                        <div>
                          <p
                            className={`text-sm font-semibold ${meeting._tab === "cancelled"
                              ? "text-neutral-400 line-through"
                              : meeting._tab === "past"
                                ? "text-neutral-500"
                                : "text-neutral-900"}`}
                          >
                            {meeting.title}
                          </p>
                          <p className="mt-0.5 text-xs text-neutral-500">
                            {meeting.participants.length} người tham gia
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 text-sm ${meeting._tab === "upcoming" ? "text-neutral-800" : "text-neutral-400"}`}>
                      <div className="font-medium">{formatVNDate(meeting.startTime)}</div>
                      <div className="text-xs text-neutral-500">
                        {formatTimeRange(meeting.startTime, meeting.endTime)}
                      </div>
                    </td>
                    <td className={`py-4 text-sm ${meeting._tab === "upcoming" ? "text-neutral-800" : "text-neutral-400"}`}>
                      {meeting.room?.name}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[meeting._tab]}`}>
                        {statusText[meeting._tab]}
                      </span>
                    </td>
                    <td className="py-4 pr-2">
                      {meeting._tab === "cancelled" ? (
                        isOrganizer ? (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleRestore(meeting)}
                              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              <RotateCcw className="h-3 w-3" /> Khôi phục
                            </button>
                          </div>
                        ) : (
                          <div className="text-right text-xs text-neutral-300">Không có thao tác</div>
                        )
                      ) : !canManage ? (
                        <div className="text-right text-xs text-neutral-300">
                          {isOrganizer ? "Không có thao tác" : "Bạn được mời"}
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(meeting)}
                            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                          >
                            <Pencil className="h-3 w-3" /> Sửa
                          </button>
                          <button
                            onClick={() => handleCancel(meeting)}
                            className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
                          >
                            <X className="h-3 w-3" /> Hủy
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-sm text-neutral-400">
                    Không có cuộc họp nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      <CreateMeetingModal
        open={modal === "create"}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
        submitting={submitting}
        meeting={editingMeeting}
      />
      <SuccessModal open={modal === "success"} onClose={() => setModal(null)} meeting={successMeeting} />
      <ConflictModal
        open={modal === "conflict"}
        onClose={() => setModal("create")}
        onForceCreate={handleForceSubmit}
        forcing={submitting}
        conflict={conflictInfo?.report}
        roomName={conflictInfo?.roomName}
        isEdit
      />
    </div>
  );
}
