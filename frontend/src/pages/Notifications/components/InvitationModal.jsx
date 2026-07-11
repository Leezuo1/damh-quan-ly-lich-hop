import { X, Calendar, Clock, MapPin, FileText, Users, Video, Check } from "lucide-react";
import { toast } from "sonner";
import { useMeeting, useRespondMeeting } from "../../../hooks/useMeetings";
import { useAuth } from "../../../context/AuthContext";
import { formatTimeRange, formatVNDate } from "../../../utils/formatters";

// meetingId: id cuộc họp cần xem chi tiết lời mời (lấy từ notification hoặc từ trang Lời mời).
export function InvitationModal({ open, onClose, meetingId }) {
  const { user } = useAuth();
  const { data: meeting, isLoading } = useMeeting(open ? meetingId : undefined);
  const respondMeeting = useRespondMeeting();

  if (!open) return null;

  const myParticipant = meeting?.participants.find((p) => p.userId === user?.id);

  function respond(status) {
    if (!meeting) return;
    respondMeeting.mutate(
      { id: meeting.id, status },
      {
        onSuccess: () => {
          toast.success(status === "accepted" ? "Đã chấp nhận lời mời." : "Đã từ chối lời mời.");
          onClose();
        },
        onError: (err) => toast.error(err.message || "Có lỗi xảy ra."),
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-500">LỜI MỜI HỌP</p>
            <h2 className="text-lg font-bold text-neutral-900">Bạn được mời tham gia cuộc họp</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading || !meeting ? (
          <div className="p-10 text-center text-sm text-neutral-400">Đang tải...</div>
        ) : (
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-neutral-500">Tổ chức bởi: {meeting.organizer?.name}</p>
                <h3 className="mt-1 text-xl font-bold text-neutral-900">{meeting.title}</h3>
              </div>
              {meeting.isImportant && (
                <span className="rounded-full bg-[#22b573] px-3 py-1 text-xs font-semibold text-white">
                  Quan trọng
                </span>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InfoCard icon={<Calendar className="h-4 w-4" />} label="NGÀY" value={formatVNDate(meeting.startTime)} />
              <InfoCard icon={<Clock className="h-4 w-4" />} label="THỜI GIAN" value={formatTimeRange(meeting.startTime, meeting.endTime)} />
              <InfoCard icon={<MapPin className="h-4 w-4" />} label="PHÒNG HỌP" value={`${meeting.room?.name ?? ""}${meeting.room?.floor ? ` - ${meeting.room.floor}` : ""}`} />
            </div>

            {meeting.description && (
              <div className="mt-6">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <FileText className="h-4 w-4" /> Nội dung
                </h4>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{meeting.description}</p>
              </div>
            )}

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <Users className="h-4 w-4" /> Người tham gia
                </h4>
                <span className="text-xs text-neutral-500">{meeting.participants.length} người</span>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#22b573] text-xs font-semibold text-white">
                    {meeting.organizer?.name?.[0]?.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{meeting.organizer?.name}</p>
                    <p className="text-xs text-neutral-500 truncate">{meeting.organizer?.position}</p>
                  </div>
                  <span className="text-xs text-neutral-400">Tổ chức</span>
                </li>
                {meeting.participants.map((p) => (
                  <li key={p.userId} className="flex items-center gap-3 rounded-lg border border-neutral-200 px-3 py-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                      {p.name?.[0]?.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{p.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{p.position}</p>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {p.status === "accepted" ? "Đã chấp nhận" : p.status === "declined" ? "Đã từ chối" : "Chưa phản hồi"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {meeting.onlineLink && (
              <div className="mt-6 rounded-lg border border-neutral-200 px-3 py-2 flex items-center gap-2 text-sm text-neutral-700">
                <Video className="h-4 w-4 text-neutral-500" />
                <span>Link online:</span>
                <a href={meeting.onlineLink} target="_blank" rel="noreferrer" className="text-[#22b573] hover:underline truncate">
                  {meeting.onlineLink}
                </a>
              </div>
            )}

            {myParticipant && myParticipant.status !== "pending" ? (
              <p className="mt-6 rounded-lg bg-neutral-50 px-3 py-2 text-center text-sm text-neutral-600">
                Bạn đã {myParticipant.status === "accepted" ? "chấp nhận" : "từ chối"} lời mời này.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => respond("declined")}
                  disabled={respondMeeting.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" /> Từ chối
                </button>
                <button
                  onClick={() => respond("accepted")}
                  disabled={respondMeeting.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#22b573] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1ea366] disabled:opacity-50"
                >
                  <Check className="h-4 w-4" /> Chấp nhận
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-neutral-500">
        {icon} {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}
