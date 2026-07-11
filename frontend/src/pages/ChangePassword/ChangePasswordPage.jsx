import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppSidebar } from "@/layouts/AppLayout/AppSidebar";
import { Eye, EyeOff, KeyRound, ShieldCheck, Check, X } from "lucide-react";
import { useChangePassword } from "../../hooks/useUsers";
export default function ChangePasswordPage() {
    const changePassword = useChangePassword();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState({
        c: false,
        n: false,
        f: false,
    });
    const [msg, setMsg] = useState(null);
    const rules = useMemo(() => [
        { label: "Ít nhất 8 ký tự", ok: next.length >= 8 },
        { label: "Có chữ hoa (A-Z)", ok: /[A-Z]/.test(next) },
        { label: "Có chữ thường (a-z)", ok: /[a-z]/.test(next) },
        { label: "Có số (0-9)", ok: /\d/.test(next) },
        { label: "Có ký tự đặc biệt", ok: /[^A-Za-z0-9]/.test(next) },
    ], [next]);
    const strength = rules.filter((r) => r.ok).length;
    const strengthLabel = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Mạnh", "Rất mạnh"][strength];
    const strengthColor = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-[#22b573]"][strength];
    const onSubmit = (e) => {
        e.preventDefault();
        if (!current)
            return setMsg({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại." });
        if (rules.some((r) => !r.ok))
            return setMsg({ type: "error", text: "Mật khẩu mới chưa đáp ứng yêu cầu bảo mật." });
        if (next !== confirm)
            return setMsg({ type: "error", text: "Mật khẩu xác nhận không khớp." });
        setMsg(null);
        changePassword.mutate(
            { currentPassword: current, newPassword: next },
            {
                onSuccess: () => {
                    setMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
                    setCurrent("");
                    setNext("");
                    setConfirm("");
                },
                onError: (err) => {
                    setMsg({ type: "error", text: err.message || "Không đổi được mật khẩu, thử lại nhé." });
                },
            },
        );
    };
    return (<div className="flex min-h-screen bg-neutral-50">
      <AppSidebar active={"lich-hop"}/>
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22b573]/10 text-[#22b573]">
              <KeyRound className="h-5 w-5"/>
            </span>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Đổi mật khẩu</h1>
              <p className="text-sm text-neutral-500">Đảm bảo mật khẩu mạnh để bảo vệ tài khoản của bạn.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
            <PasswordInput label="Mật khẩu hiện tại" value={current} onChange={setCurrent} show={show.c} onToggle={() => setShow({ ...show, c: !show.c })}/>
            <PasswordInput label="Mật khẩu mới" value={next} onChange={setNext} show={show.n} onToggle={() => setShow({ ...show, n: !show.n })}/>

            {next && (<div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-neutral-500">Độ mạnh mật khẩu</span>
                  <span className="font-medium text-neutral-700">{strengthLabel}</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (<span key={i} className={`h-1.5 rounded-full ${i < strength ? strengthColor : "bg-neutral-200"}`}/>))}
                </div>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1 text-xs">
                  {rules.map((r) => (<li key={r.label} className={`flex items-center gap-1.5 ${r.ok ? "text-[#22b573]" : "text-neutral-400"}`}>
                      {r.ok ? <Check className="h-3.5 w-3.5"/> : <X className="h-3.5 w-3.5"/>}
                      {r.label}
                    </li>))}
                </ul>
              </div>)}

            <PasswordInput label="Xác nhận mật khẩu mới" value={confirm} onChange={setConfirm} show={show.f} onToggle={() => setShow({ ...show, f: !show.f })} error={confirm.length > 0 && confirm !== next ? "Mật khẩu không khớp" : undefined}/>

            {msg && (<div className={`text-sm rounded-lg px-3 py-2 ${msg.type === "success"
                ? "bg-[#22b573]/10 text-[#1ea366]"
                : "bg-red-50 text-red-600"}`}>
                {msg.text}
              </div>)}

            <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
              <Link to="/profile" className="text-sm text-neutral-500 hover:text-neutral-700">
                ← Quay lại hồ sơ
              </Link>
              <button type="submit" disabled={changePassword.isPending} className="inline-flex items-center gap-2 rounded-lg bg-[#22b573] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ea366] disabled:opacity-60">
                <ShieldCheck className="h-4 w-4"/> {changePassword.isPending ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>);
}
function PasswordInput({ label, value, onChange, show, onToggle, error, }) {
    return (<div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#22b573]/30 focus:border-[#22b573] ${error ? "border-red-400" : "border-neutral-200"}`} placeholder="••••••••"/>
        <button type="button" onClick={onToggle} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-600">
          {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>);
}
