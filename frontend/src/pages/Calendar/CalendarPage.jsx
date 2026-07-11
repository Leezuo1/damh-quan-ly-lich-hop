import { Link } from "@tanstack/react-router";
import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import { Bell, Filter, X } from "lucide-react";
import { toast } from "sonner";
import { AppSidebar } from "../../layouts/AppLayout/AppSidebar";
import { ConflictModal, CreateMeetingModal, SuccessModal } from "./components/CreateMeetingModal";
import { useCreateMeeting, useMeetings, useUpdateMeeting } from "../../hooks/useMeetings";
import { useRooms } from "../../hooks/useRooms";
import { ApiError } from "../../lib/api";
import { formatTime } from "../../utils/formatters";

const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const dayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const GRID_START_HOUR = 8;
const ROW_HEIGHT_PX = 56;
const colorPalette = [
  "bg-[#d6f0df] border-l-4 border-[#22b573] text-[#0f5132]",
  "bg-blue-100 border-l-4 border-blue-500 text-blue-900",
  "bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900",
  "bg-purple-100 border-l-4 border-purple-500 text-purple-900",
];

function sameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(date.getDate() + days);
  return nextDate;
}
function formatDateLabel(date) {
  return `${dayLabels[date.getDay()]} · ${date.getDate()}/${date.getMonth() + 1}`;
}

// Đổi meeting thật thành vị trí (top/height theo px) trên lưới giờ 08:00-17:00.
function positionOfMeeting(meeting) {
  const start = new Date(meeting.startTime);
  const end = new Date(meeting.endTime);
  const startOffsetMin = (start.getHours() - GRID_START_HOUR) * 60 + start.getMinutes();
  const durationMin = (end.getTime() - start.getTime()) / 60000;
  return {
    date: start,
    top: (startOffsetMin / 60) * ROW_HEIGHT_PX + 2,
    height: Math.max((durationMin / 60) * ROW_HEIGHT_PX - 4, 20),
  };
}

export default function CalendarPage() {
  const [modal, setModal] = useState(null);
  const [successMeeting, setSuccessMeeting] = useState(null);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [view, setView] = useState("Tuần");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [organizer, setOrganizer] = useState("");
  const [room, setRoom] = useState("");
  const [q, setQ] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const visibleDates = useMemo(() => {
    if (view === "Ngày") return [selectedDate];
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [selectedDate, view]);

  const rangeFrom = view === "Ngày" ? startOfDay(selectedDate) : startOfWeek(selectedDate, { weekStartsOn: 1 });
  const rangeTo = view === "Ngày" ? endOfDay(selectedDate) : endOfWeek(selectedDate, { weekStartsOn: 1 });

  const { data: meetings = [], isLoading } = useMeetings({
    from: rangeFrom.toISOString(),
    to: rangeTo.toISOString(),
  });

  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const submitting = createMeeting.isPending || updateMeeting.isPending;
  const { data: allRooms = [] } = useRooms();

  const organizers = useMemo(
    () => Array.from(new Set(meetings.map((m) => m.organizer?.name).filter(Boolean))),
    [meetings],
  );
  const rooms = useMemo(
    () => Array.from(new Set(meetings.map((m) => m.room?.name).filter(Boolean))),
    [meetings],
  );
  const activeCount = (organizer ? 1 : 0) + (room ? 1 : 0) + (q ? 1 : 0);

  const filtered = useMemo(() => {
    return meetings.filter((meeting) => {
      if (meeting.status === "cancelled") return false;
      if (organizer && meeting.organizer?.name !== organizer) return false;
      if (room && meeting.room?.name !== room) return false;
      if (q && !meeting.title.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [meetings, organizer, room, q]);

  const selectDateFromSidebar = (date) => {
    setSelectedDate(date);
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };
  const changeSidebarMonth = (date) => {
    setCalendarMonth(date);
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), 1));
  };
  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };
  const moveRange = (step) => {
    const nextDate = addDays(selectedDate, view === "Ngày" ? step : step * 7);
    setSelectedDate(nextDate);
    setCalendarMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  };
  const resetFilters = () => {
    setOrganizer("");
    setRoom("");
    setQ("");
  };

  function openCreate() {
    setModal("create");
  }

  function handleSubmit(dto, meetingId) {
    const mutation = meetingId ? updateMeeting : createMeeting;
    const payload = meetingId ? { id: meetingId, dto } : dto;
    mutation.mutate(payload, {
      onSuccess: (meeting) => {
        setSuccessMeeting(meeting);
        setModal("success");
      },
      onError: (err) => {
        if (err instanceof ApiError && err.status === 409) {
          setConflictInfo({
            report: err.body,
            dto,
            meetingId,
            roomName: allRooms.find((r) => r.id === dto.roomId)?.name,
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
    const { dto, meetingId } = conflictInfo;
    const forcedDto = { ...dto, force: true };
    const mutation = meetingId ? updateMeeting : createMeeting;
    const payload = meetingId ? { id: meetingId, dto: forcedDto } : forcedDto;
    mutation.mutate(payload, {
      onSuccess: (meeting) => {
        setSuccessMeeting(meeting);
        setModal("success");
      },
      onError: (err) => toast.error(err.message || "Có lỗi xảy ra, thử lại nhé."),
    });
  }

  return (
    <div className="flex h-screen bg-white">
      <AppSidebar
        active="lich-hop"
        onCreate={openCreate}
        selectedDate={selectedDate}
        calendarMonth={calendarMonth}
        onSelectDate={selectDateFromSidebar}
        onChangeMonth={changeSidebarMonth}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 border-b border-neutral-200 px-6 py-3">
          <button onClick={goToToday} className="text-sm text-neutral-500 hover:text-neutral-900">
            Hôm nay
          </button>
          <div className="flex gap-2 text-neutral-500">
            <button onClick={() => moveRange(-1)} className="rounded px-1 hover:bg-neutral-100">‹</button>
            <button onClick={() => moveRange(1)} className="rounded px-1 hover:bg-neutral-100">›</button>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {["Ngày", "Tuần"].map((mode) => (
              <button
                key={mode}
                onClick={() => setView(mode)}
                className={`rounded-md px-3 py-1 text-sm ${view === mode ? "bg-[#d6f0df] text-[#0f5132] font-semibold" : "text-neutral-600 hover:bg-neutral-100"}`}
              >
                {mode}
              </button>
            ))}
            <button
              onClick={() => setShowFilter((open) => !open)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1 text-sm ${showFilter || activeCount > 0
                ? "border-[#22b573] text-[#0f5132] bg-[#d6f0df]"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
            >
              <Filter className="h-3.5 w-3.5" /> Bộ lọc
              {activeCount > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#22b573] px-1 text-[10px] font-semibold text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <Link to="/notifications" className="text-neutral-500 hover:text-neutral-900" aria-label="Thông báo">
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {showFilter && (
          <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[180px]">
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">Người tổ chức</label>
                <select value={organizer} onChange={(e) => setOrganizer(e.target.value)} className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm">
                  <option value="">Tất cả</option>
                  {organizers.map((name) => (<option key={name} value={name}>{name}</option>))}
                </select>
              </div>
              <div className="min-w-[160px]">
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">Phòng họp</label>
                <select value={room} onChange={(e) => setRoom(e.target.value)} className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm">
                  <option value="">Tất cả</option>
                  {rooms.map((roomName) => (<option key={roomName} value={roomName}>{roomName}</option>))}
                </select>
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-[11px] font-medium text-neutral-600 mb-1">Tìm cuộc họp</label>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập tên cuộc họp..." className="w-full rounded-md border border-neutral-200 bg-white px-2 py-1.5 text-sm" />
              </div>
              <button onClick={resetFilters} disabled={activeCount === 0} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-40">
                <X className="h-3.5 w-3.5" /> Xóa lọc
              </button>
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Hiển thị <b className="text-neutral-800">{filtered.length}</b> cuộc họp trong khung đang xem
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <div className={view === "Ngày" ? "min-w-[520px]" : "min-w-[900px]"}>
            <div className="grid border-b border-neutral-200 sticky top-0 bg-white z-10" style={{ gridTemplateColumns: `64px repeat(${visibleDates.length}, minmax(0, 1fr))` }}>
              <div />
              {visibleDates.map((date) => (
                <button key={date.toISOString()} onClick={() => setSelectedDate(date)} className="px-2 py-2 text-center border-l border-neutral-200 hover:bg-neutral-50">
                  <div className="text-xs text-neutral-500">{formatDateLabel(date)}</div>
                  <div className={`mx-auto mt-1 text-lg font-semibold ${sameDate(date, selectedDate)
                    ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#22b573] text-white"
                    : "text-neutral-800"}`}>
                    {date.getDate()}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid relative" style={{ gridTemplateColumns: `64px repeat(${visibleDates.length}, minmax(0, 1fr))` }}>
              <div className="pt-1.5">
                {hours.map((hour) => (
                  <div key={hour} className="h-14 border-b border-neutral-100 px-2 text-[11px] text-neutral-400 -translate-y-1.5">
                    {hour}
                  </div>
                ))}
              </div>
              {visibleDates.map((date) => (
                <div key={date.toISOString()} className="relative border-l border-neutral-200">
                  {hours.map((hour) => (<div key={hour} className="h-14 border-b border-neutral-100" />))}
                  {filtered
                    .filter((meeting) => sameDate(new Date(meeting.startTime), date))
                    .map((meeting, index) => {
                      const { top, height } = positionOfMeeting(meeting);
                      return (
                        <div
                          key={meeting.id}
                          className={`absolute left-1 right-1 rounded-md px-2 py-1 text-xs shadow-sm ${colorPalette[index % colorPalette.length]}`}
                          style={{ top, height }}
                        >
                          <div className="font-semibold truncate">{meeting.title}</div>
                          <div className="text-[10px] opacity-75 truncate">
                            {formatTime(meeting.startTime)} · {meeting.room?.name}
                          </div>
                          <div className="text-[10px] opacity-60 truncate">{meeting.organizer?.name}</div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
            {isLoading && <div className="p-6 text-center text-sm text-neutral-400">Đang tải lịch họp...</div>}
          </div>
        </div>
      </main>

      <CreateMeetingModal
        open={modal === "create"}
        onClose={() => setModal(null)}
        onSubmit={handleSubmit}
        submitting={submitting}
        meeting={null}
      />
      <SuccessModal open={modal === "success"} onClose={() => setModal(null)} meeting={successMeeting} />
      <ConflictModal
        open={modal === "conflict"}
        onClose={() => setModal("create")}
        onForceCreate={handleForceSubmit}
        forcing={submitting}
        conflict={conflictInfo?.report}
        roomName={conflictInfo?.roomName}
        isEdit={!!conflictInfo?.meetingId}
      />
    </div>
  );
}
