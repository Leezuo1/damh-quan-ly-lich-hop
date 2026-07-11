import { Link } from "@tanstack/react-router";
import { Calendar, ChevronUp, KeyRound, LogOut, Plus, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useNotifications";
const weekLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
function sameDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getMiniCalendarDays(monthDate) {
    // Tui để đủ 6 hàng cho lịch khỏi bị nhảy khi đổi tháng.
    const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);
        return date;
    });
}
export function AppSidebar({ active, onCreate, selectedDate = new Date(), calendarMonth = selectedDate, onSelectDate, onChangeMonth, }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { data: unreadData } = useUnreadCount();
    const notifCount = unreadData?.count ?? 0;
    const miniDays = getMiniCalendarDays(calendarMonth);
    const initials = user?.name
        ? user.name
            .split(" ")
            .filter(Boolean)
            .slice(-2)
            .map((part) => part[0]?.toUpperCase())
            .join("")
        : "??";
    const items = [
        { key: "lich-hop", label: "Lịch họp", to: "/calendar" },
        { key: "cuoc-hop-cua-toi", label: "Cuộc họp của tôi", to: "/my-meetings" },
        { key: "phong-hop", label: "Phòng họp", to: "/rooms" },
        { key: "thong-bao", label: "Thông báo", to: "/notifications" },
    ];
    const changeMonth = (step) => {
        // Chỗ này chỉ đổi tháng đang xem, ngày được chọn thì trang bên ngoài tự cập nhật.
        const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + step, 1);
        onChangeMonth?.(nextMonth);
    };
    return (<aside className="w-[260px] shrink-0 border-r border-neutral-200 bg-white flex flex-col h-screen">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22b573]">
            <Calendar className="h-4 w-4 text-white" strokeWidth={2.5}/>
          </span>
          <span className="text-sm font-semibold text-neutral-900">Quản Lý Lịch Họp</span>
        </div>
      </div>

      <div className="p-4">
        <button onClick={onCreate} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#22b573] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1ea366]">
          <Plus className="h-4 w-4"/> Tạo lịch họp
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-800">
            Tháng {calendarMonth.getMonth() + 1}, {calendarMonth.getFullYear()}
          </span>
          <div className="flex gap-1 text-xs text-neutral-500">
            <button onClick={() => changeMonth(-1)} className="rounded px-1 hover:bg-neutral-100">
              ‹
            </button>
            <button onClick={() => changeMonth(1)} className="rounded px-1 hover:bg-neutral-100">
              ›
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-neutral-400 mb-1">
          {weekLabels.map((day) => (<span key={day}>{day}</span>))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {miniDays.map((date) => {
            // Ngày ngoài tháng thì cho nó hiện mờ để lịch vẫn đủ tuần.
            const inMonth = date.getMonth() === calendarMonth.getMonth();
            const activeDay = sameDate(date, selectedDate);
            return (<button key={date.toISOString()} onClick={() => onSelectDate?.(date)} className={`py-1 rounded ${activeDay
                    ? "bg-[#22b573] text-white font-semibold"
                    : inMonth
                        ? "text-neutral-700 hover:bg-neutral-100"
                        : "text-neutral-300 hover:bg-neutral-50"}`}>
                {date.getDate()}
              </button>);
        })}
        </div>
      </div>

      <nav className="px-2 flex-1">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.key === active;
            return (<li key={item.key}>
                <Link to={item.to} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${isActive ? "text-[#22b573] font-semibold" : "text-neutral-600 hover:bg-neutral-50"}`}>
                  <span className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-[#22b573]" : "bg-neutral-300"}`}/>
                    {item.label}
                  </span>
                  {item.key === "thong-bao" && notifCount > 0 && (<span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#22b573] px-1.5 text-[10px] font-semibold text-white">
                      {notifCount}
                    </span>)}
                </Link>
              </li>);
        })}
        </ul>
      </nav>

      <div className="relative p-4 border-t border-neutral-200">
        {menuOpen && (<>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}/>
            <div className="absolute left-4 right-4 bottom-[72px] z-20 rounded-lg border border-neutral-200 bg-white shadow-lg py-1">
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                <User className="h-4 w-4 text-neutral-500"/> Thông tin cá nhân
              </Link>
              <Link to="/change-password" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                <KeyRound className="h-4 w-4 text-neutral-500"/> Đổi mật khẩu
              </Link>
              <div className="my-1 border-t border-neutral-100"/>
              <button onClick={() => { setMenuOpen(false); logout(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4"/> Đăng xuất
              </button>
            </div>
          </>)}
        <button onClick={() => setMenuOpen((open) => !open)} className="w-full flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
            {initials}
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name ?? "Đang tải..."}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.position ?? ""}</p>
          </div>
          <ChevronUp className={`h-4 w-4 text-neutral-400 transition-transform ${menuOpen ? "" : "rotate-180"}`}/>
        </button>
      </div>
    </aside>);
}
