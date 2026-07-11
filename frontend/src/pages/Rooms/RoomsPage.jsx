import { endOfDay, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { Users, Monitor, Wifi, Video, Mic, Coffee, Search } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "../../layouts/AppLayout/AppSidebar";
import { useRooms } from "../../hooks/useRooms";
import { useCreateMeeting, useMeetings } from "../../hooks/useMeetings";
import { ConflictModal, CreateMeetingModal, SuccessModal } from "../Calendar/components/CreateMeetingModal";
import { ApiError } from "../../lib/api";

// Chỗ này dùng để đổi mã thiết bị (backend trả string tự do) thành icon dễ đọc.
// Thiết bị không khớp danh sách known thì hiện icon mặc định + đúng tên gốc.
const EQUIP_META = {
  "Máy chiếu": Monitor,
  "Wi-Fi": Wifi,
  "Video call": Video,
  Microphone: Mic,
  Mic: Mic,
  Loa: Mic,
  Coffee: Coffee,
  "Bảng trắng": Monitor,
  "Màn hình TV": Monitor,
};
const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 8..17

// Tui gom mấy class Tailwind dài ra đây cho dễ nhìn.
const khung_trang = "flex h-screen bg-white";
const noi_dung_chinh = "flex-1 flex flex-col overflow-hidden";
const hang_tieu_de = "flex items-center justify-between px-8 pt-6 pb-4";
const o_tim_kiem = "w-64 rounded-lg border border-neutral-200 pl-8 pr-3 py-1.5 text-sm outline-none focus:border-[#22b573]";
const nut_dat_phong = "rounded-lg bg-[#22b573] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1ea366]";
const nut_nho = "rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50";
const the_phong = "rounded-xl border border-neutral-200 bg-white p-5 hover:shadow-sm transition-shadow";

function bookingsForRoom(meetings, roomId) {
  return meetings
    .filter((m) => m.room?.id === roomId && m.status === "scheduled")
    .map((m) => ({ start: new Date(m.startTime), end: new Date(m.endTime), title: m.title }));
}
function isBusyAtHour(bookings, hour, day) {
  const hourDate = new Date(day);
  hourDate.setHours(hour, 0, 0, 0);
  return bookings.some((b) => hourDate >= b.start && hourDate < b.end);
}
function currentStatus(bookings, now) {
  return bookings.some((b) => now >= b.start && now < b.end) ? "busy" : "free";
}

export default function RoomsPage() {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(undefined);
  const [successMeeting, setSuccessMeeting] = useState(null);
  const [conflictInfo, setConflictInfo] = useState(null);

  const now = useMemo(() => new Date(), []);
  const { data: rooms = [], isLoading } = useRooms();
  const { data: todaysMeetings = [] } = useMeetings({
    from: startOfDay(now).toISOString(),
    to: endOfDay(now).toISOString(),
  });
  const createMeeting = useCreateMeeting();

  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));

  function openBooking(roomId) {
    setSelectedRoomId(roomId);
    setModal("create");
  }

  function handleSubmit(dto) {
    createMeeting.mutate(dto, {
      onSuccess: (meeting) => {
        setSuccessMeeting(meeting);
        setModal("success");
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          setConflictInfo({
            report: err.body,
            dto,
            roomName: rooms.find((r) => r.id === dto.roomId)?.name,
          });
          setModal("conflict");
        } else {
          toast.error(err.message || "Có lỗi xảy ra, thử lại nhé.");
        }
      },
    });
  }

  function handleForceSubmit() {
    if (!conflictInfo) return;
    createMeeting.mutate(
      { ...conflictInfo.dto, force: true },
      {
        onSuccess: (meeting) => {
          setSuccessMeeting(meeting);
          setModal("success");
        },
        onError: (err) => toast.error(err.message || "Có lỗi xảy ra, thử lại nhé."),
      },
    );
  }

  return (
    <div className={khung_trang}>
      <AppSidebar active="phong-hop" onCreate={() => openBooking(undefined)} />
      <main className={noi_dung_chinh}>
        <div className={hang_tieu_de}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">Phòng họp</h1>
            <span className="rounded-full bg-[#d6f0df] px-2.5 py-0.5 text-xs font-semibold text-[#0f5132]">
              {rooms.length} phòng
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm phòng..." className={o_tim_kiem} />
            </div>
            <button onClick={() => openBooking(undefined)} className={nut_dat_phong}>
              + Đặt phòng
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-8 pb-8 space-y-4">
          {!isLoading && filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-neutral-400">Không có phòng nào.</p>
          )}
          {filtered.map((r) => {
            const bookings = bookingsForRoom(todaysMeetings, r.id);
            const status = currentStatus(bookings, now);
            return (
              <div key={r.id} className={the_phong}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900">{r.name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${status === "free"
                          ? "bg-[#d6f0df] text-[#0f5132]"
                          : "bg-rose-100 text-rose-600"}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status === "free" ? "bg-[#22b573]" : "bg-rose-500"}`} />
                        {status === "free" ? "Trống" : "Đang dùng"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {r.capacity} chỗ
                      </span>
                      {r.floor && <span>{r.floor}</span>}
                      <span className="inline-flex items-center gap-2">
                        {(r.equipment ?? []).map((e) => {
                          const Icon = EQUIP_META[e] ?? Monitor;
                          return (
                            <span key={e} title={e} className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-1.5 py-0.5">
                              <Icon className="h-3 w-3" /> {e}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => openBooking(r.id)} className={nut_nho}>
                    Đặt phòng này
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold text-neutral-500 mb-1.5">Lịch hôm nay</p>
                  <div className="flex gap-0.5">
                    {HOURS.map((h) => {
                      const busy = isBusyAtHour(bookings, h, now);
                      const booking = bookings.find((b) => h >= b.start.getHours() && h < b.end.getHours());
                      return (
                        <div
                          key={h}
                          className="flex-1"
                          title={booking ? `${booking.title}` : `${h}:00 – Trống`}
                        >
                          <div className={`h-8 rounded ${busy ? "bg-rose-200 border border-rose-300" : "bg-[#e8f7ee] border border-[#c6ebd3]"}`} />
                          <div className="mt-1 text-center text-[10px] text-neutral-400">{h}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-[#e8f7ee] border border-[#c6ebd3]" />
                      Trống
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm bg-rose-200 border border-rose-300" />
                      Đã đặt
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <CreateMeetingModal
        open={modal === "create"}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
        submitting={createMeeting.isPending}
        meeting={null}
        initialRoomId={selectedRoomId}
      />
      <SuccessModal open={modal === "success"} onClose={() => setModal(null)} meeting={successMeeting} />
      <ConflictModal
        open={modal === "conflict"}
        onClose={() => setModal("create")}
        onForceCreate={handleForceSubmit}
        forcing={createMeeting.isPending}
        conflict={conflictInfo?.report}
        roomName={conflictInfo?.roomName}
      />
    </div>
  );
}
