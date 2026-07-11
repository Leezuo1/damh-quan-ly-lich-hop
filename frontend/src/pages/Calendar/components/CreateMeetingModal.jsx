import { format } from "date-fns";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendeePicker } from "../../../components/AttendeePicker";
import { useRooms } from "../../../hooks/useRooms";
import { formatTimeRange, formatVNDate } from "../../../utils/formatters";

// Đây là danh sách giờ và phút dùng cho mấy ô chọn thời gian.
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// Tui gom mấy class dài ra đây cho bên dưới dễ nhìn hơn.
const khung_modal = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4";
const hop_modal = "w-full max-w-md rounded-2xl bg-white p-6 shadow-xl";
const hang_tieu_de = "mb-5 flex items-center justify-between";
const luoi_gio_phut = "grid grid-cols-2 gap-1";
const hang_nut = "mt-6 flex justify-end gap-2";

const nhan_o_nhap = "mb-1 block text-xs font-semibold text-neutral-700";
const o_nhap_chinh = "w-full rounded-lg border-2 border-[#22b573] px-3 py-2 text-sm focus:outline-none";
const o_nhap_thuong = "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm";
const o_chon_gio = "w-full rounded-lg border border-neutral-200 px-2 py-2 text-sm";

const nut_dong = "text-neutral-400 hover:text-neutral-700";
const nut_huy = "rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50";
const nut_chinh = "rounded-lg bg-[#22b573] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ea366] disabled:opacity-50";

function đổiRaPhút(giờ, phút) {
  return Number(giờ) * 60 + Number(phút);
}

function ghépNgàyGiờ(ngày, giờ, phút) {
  return new Date(`${ngày}T${giờ}:${phút}:00`);
}

const trốngRỗng = {
  title: "",
  ngàyHọp: format(new Date(), "yyyy-MM-dd"),
  giờBắtĐầu: "09",
  phútBắtĐầu: "00",
  giờKếtThúc: "10",
  phútKếtThúc: "00",
  roomId: "",
  participants: [],
};

// meeting: truyền vào khi ở chế độ sửa (prefill form + submit gọi update thay vì create).
// initialRoomId: chỉ dùng khi tạo mới, để preselect sẵn 1 phòng (vd bấm "Đặt phòng này" ở trang Phòng họp).
export function CreateMeetingModal({ open, onClose, onSubmit, submitting, meeting, initialRoomId }) {
  const [title, setTitle] = useState(trốngRỗng.title);
  const [ngàyHọp, setNgàyHọp] = useState(trốngRỗng.ngàyHọp);
  const [giờBắtĐầu, setGiờBắtĐầu] = useState(trốngRỗng.giờBắtĐầu);
  const [phútBắtĐầu, setPhútBắtĐầu] = useState(trốngRỗng.phútBắtĐầu);
  const [giờKếtThúc, setGiờKếtThúc] = useState(trốngRỗng.giờKếtThúc);
  const [phútKếtThúc, setPhútKếtThúc] = useState(trốngRỗng.phútKếtThúc);
  const [roomId, setRoomId] = useState(trốngRỗng.roomId);
  const [participants, setParticipants] = useState(trốngRỗng.participants);

  const { data: rooms = [] } = useRooms();

  useEffect(() => {
    if (!open) return;
    if (meeting) {
      const start = new Date(meeting.startTime);
      const end = new Date(meeting.endTime);
      setTitle(meeting.title);
      setNgàyHọp(format(start, "yyyy-MM-dd"));
      setGiờBắtĐầu(format(start, "HH"));
      setPhútBắtĐầu(format(start, "mm"));
      setGiờKếtThúc(format(end, "HH"));
      setPhútKếtThúc(format(end, "mm"));
      setRoomId(meeting.room?.id ?? "");
      setParticipants(
        (meeting.participants ?? []).map((p) => ({ id: p.userId, name: p.name, position: p.position })),
      );
    } else {
      setTitle(trốngRỗng.title);
      setNgàyHọp(trốngRỗng.ngàyHọp);
      setGiờBắtĐầu(trốngRỗng.giờBắtĐầu);
      setPhútBắtĐầu(trốngRỗng.phútBắtĐầu);
      setGiờKếtThúc(trốngRỗng.giờKếtThúc);
      setPhútKếtThúc(trốngRỗng.phútKếtThúc);
      setRoomId(initialRoomId ?? trốngRỗng.roomId);
      setParticipants(trốngRỗng.participants);
    }
  }, [open, meeting, initialRoomId]);

  function sửaGiờKếtThúcNếuSai(giờMới, phútMới) {
    const bắtĐầu = đổiRaPhút(giờMới, phútMới);
    const kếtThúc = đổiRaPhút(giờKếtThúc, phútKếtThúc);

    // Nếu giờ kết thúc bị sai thì cho nó thành sau giờ bắt đầu 1 tiếng.
    if (kếtThúc <= bắtĐầu) {
      const giờSau = Math.min(bắtĐầu + 60, 23 * 60 + 59);
      setGiờKếtThúc(String(Math.floor(giờSau / 60)).padStart(2, "0"));
      setPhútKếtThúc(String(giờSau % 60).padStart(2, "0"));
    }
  }

  function đổiGiờBắtĐầu(value) {
    setGiờBắtĐầu(value);
    sửaGiờKếtThúcNếuSai(value, phútBắtĐầu);
  }

  function đổiPhútBắtĐầu(value) {
    setPhútBắtĐầu(value);
    sửaGiờKếtThúcNếuSai(giờBắtĐầu, value);
  }

  if (!open) return null;

  const hợpLệ = title.trim() && roomId && participants.length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!hợpLệ) return;
    const startTime = ghépNgàyGiờ(ngàyHọp, giờBắtĐầu, phútBắtĐầu);
    const endTime = ghépNgàyGiờ(ngàyHọp, giờKếtThúc, phútKếtThúc);
    onSubmit(
      {
        title: title.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        roomId,
        participantIds: participants.map((p) => p.id),
        force: false,
      },
      meeting?.id,
    );
  }

  return (
    <div className={khung_modal}>
      <div className={hop_modal}>
        <div className={hang_tieu_de}>
          <h3 className="text-lg font-bold text-neutral-900">
            {meeting ? "Sửa cuộc họp" : "Tạo lịch họp mới"}
          </h3>
          <button onClick={onClose} className={nut_dong}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={nhan_o_nhap}>Tên cuộc họp</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Sprint Planning Q3"
              className={o_nhap_chinh}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={nhan_o_nhap}>Ngày</label>
              <input
                type="date"
                value={ngàyHọp}
                onChange={(e) => setNgàyHọp(e.target.value)}
                className={o_nhap_thuong}
              />
            </div>

            <div>
              <label className={nhan_o_nhap}>Bắt đầu</label>
              <div className={luoi_gio_phut}>
                <select
                  value={giờBắtĐầu}
                  onChange={(e) => đổiGiờBắtĐầu(e.target.value)}
                  className={o_chon_gio}
                >
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <select
                  value={phútBắtĐầu}
                  onChange={(e) => đổiPhútBắtĐầu(e.target.value)}
                  className={o_chon_gio}
                >
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={nhan_o_nhap}>Kết thúc</label>
              <div className={luoi_gio_phut}>
                <select
                  value={giờKếtThúc}
                  onChange={(e) => setGiờKếtThúc(e.target.value)}
                  className={o_chon_gio}
                >
                  {hours.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <select
                  value={phútKếtThúc}
                  onChange={(e) => setPhútKếtThúc(e.target.value)}
                  className={o_chon_gio}
                >
                  {minutes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={nhan_o_nhap}>Phòng họp</label>
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className={o_nhap_thuong}>
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.capacity} chỗ{r.floor ? ` - ${r.floor}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={nhan_o_nhap}>Mời người tham gia</label>
            <AttendeePicker value={participants} onChange={setParticipants} />
          </div>
        </form>

        <div className={hang_nut}>
          <button onClick={onClose} className={nut_huy}>
            Hủy
          </button>
          <button onClick={handleSubmit} disabled={!hợpLệ || submitting} className={nut_chinh}>
            {submitting ? "Đang xử lý..." : meeting ? "Lưu thay đổi" : "Kiểm tra & Tạo lịch"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuccessModal({ open, onClose, onView, meeting }) {
  if (!open || !meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-neutral-100 px-5 py-2 text-xs text-neutral-500">
          Đã lưu vào hệ thống
        </div>
        <div className="p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#d6f0df] text-[#22b573]">✓</div>
          <h3 className="mt-3 text-lg font-bold text-neutral-900">Đã tạo lịch họp thành công</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Lời mời đã được gửi tới {meeting.participants.length} người tham gia.
          </p>

          <div className="mt-5 space-y-2 rounded-xl bg-neutral-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Cuộc họp</span>
              <span className="font-medium text-neutral-900">{meeting.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Thời gian</span>
              <span className="font-medium text-neutral-900">
                {formatVNDate(meeting.startTime)} · {formatTimeRange(meeting.startTime, meeting.endTime)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Phòng</span>
              <span className="font-medium text-neutral-900">{meeting.room?.name}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-neutral-100">
          <button onClick={onClose} className="py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Đóng
          </button>
          <button onClick={onView ?? onClose} className="bg-[#22b573] py-3 text-sm font-semibold text-white hover:bg-[#1ea366]">
            ✓ Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConflictModal({ open, onClose, onForceCreate, forcing, conflict, roomName, isEdit }) {
  if (!open || !conflict) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="border-b border-neutral-100 px-5 py-2 text-xs text-neutral-500">
          Phát hiện trùng lịch
        </div>
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">!</div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Phát hiện xung đột lịch</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Không thể đặt lịch ở khung giờ này. Vui lòng kiểm tra:
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {conflict.room && (
              <li className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                ● <b>{roomName ?? "Phòng đã chọn"}</b> đã được đặt cho "{conflict.room.meetingTitle}" lúc{" "}
                <b>{formatTimeRange(conflict.room.startTime, conflict.room.endTime)}</b>.
              </li>
            )}
            {conflict.participants.map((p) => (
              <li key={p.userId} className="rounded-lg bg-rose-50 px-3 py-2 text-rose-900">
                ● <b>{p.name}</b> đang bận với cuộc họp "{p.meetingTitle}" trong khung giờ này.
              </li>
            ))}
          </ul>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Chọn thời gian khác
            </button>
            <button
              onClick={onForceCreate}
              disabled={forcing}
              className="rounded-lg bg-[#22b573] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ea366] disabled:opacity-50"
            >
              {forcing ? "Đang xử lý..." : isEdit ? "Vẫn lưu" : "Vẫn tạo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
