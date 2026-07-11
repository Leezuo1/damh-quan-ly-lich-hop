import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppSidebar } from "../../layouts/AppLayout/AppSidebar";
import { ArrowLeft, Calendar, Clock, MapPin, FileText, Users, Video, Check, X } from "lucide-react";
import { Route } from "../../routes/invitations";
import { useMeeting, useRespondMeeting } from "../../hooks/useMeetings";
import { useAuth } from "../../context/AuthContext";
import { formatTimeRange, formatVNDate } from "../../utils/formatters";

export default function InvitationsPage() {
  const { meetingId } = Route.useSearch();
  const { user } = useAuth();
  const { data: meeting, isLoading } = useMeeting(meetingId);
  const respondMeeting = useRespondMeeting();

  const myParticipant = meeting?.participants.find((p) => p.userId === user?.id);

  function respond(status) {
    if (!meeting) return;
    respondMeeting.mutate(
      { id: meeting.id, status },
      {
        onSuccess: () => toast.success(status === "accepted" ? "Đã chấp nhận lời mời." : "Đã từ chối lời mời."),
        onError: (err) => toast.error(err.message || "Có lỗi xảy ra."),
      },
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <AppSidebar active="thong-bao" />

      <main className="flex-1 overflow-y-auto">
        <div className="border-b border-neutral-200 bg-white px-6 py-3">
          <Link to="/notifications" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900">
            <ArrowLeft className="h-4 w-4" /> Thông báo
          </Link>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {!meetingId ? (
            <p className="text-sm text-neutral-500">
              Không có lời mời nào được chọn. Hãy vào{" "}
              <Link to="/notifications" className="text-[#22b573] hover:underline">Thông báo</Link> và bấm "Xem chi tiết".
            </p>
          ) : isLoading || !meeting ? (
            <p className="text-sm text-neutral-400">Đang tải...</p>
          ) : (
            <>
              <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500">LỜI MỜI HỌP</p>
              <h1 className="mt-2 text-2xl font-bold text-neutral-900">
                Bạn được mời tham gia cuộc họp
              </h1>

              <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Tổ chức bởi: {meeting.organizer?.name}</p>
                    <h2 className="mt-1 text-xl font-bold text-neutral-900">{meeting.title}</h2>
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
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                      <FileText className="h-4 w-4" /> Nội dung
                    </h3>
                    <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{meeting.description}</p>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                      <Users className="h-4 w-4" /> Người tham gia
                    </h3>
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

              <p className="mt-4 text-center text-xs text-neutral-400">
                Bạn có thể thay đổi phản hồi bất cứ lúc nào trong mục Thông báo.
              </p>
            </>
          )}
        </div>
      </main>
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
