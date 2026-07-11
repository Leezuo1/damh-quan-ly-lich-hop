import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Calendar, Eye, EyeOff, Lock, User } from "lucide-react";
import { useLogin } from "../../hooks/useLogin";
import { useAuth } from "../../context/AuthContext";

export default function Index() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const auth = useAuth();
    const loginMutation = useLogin();

    function handleSubmit(e) {
        e.preventDefault();
        loginMutation.mutate(
            { email, password },
            {
                onSuccess: (data) => {
                    auth.login(data);
                    navigate({ to: "/calendar" });
                },
            },
        );
    }

    return (<div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Bên này là phần giới thiệu app */}
      <div className="relative overflow-hidden bg-[#d6f0df] px-10 py-10 lg:px-16 lg:py-14 flex flex-col justify-between min-h-[400px]">
        {/* Mấy mảng màu dùng để trang trí */}
        <div className="pointer-events-none absolute -top-16 right-10 h-72 w-72 rounded-full bg-[#a8dcbb] opacity-60 blur-2xl"/>
        <div className="pointer-events-none absolute bottom-24 -left-16 h-80 w-80 rounded-full bg-[#b6e3c6] opacity-70 blur-3xl"/>
        <div className="pointer-events-none absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-[#8ccfa6] opacity-40 blur-2xl"/>

        <div className="relative z-10 inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 w-fit shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22b573]">
            <Calendar className="h-4 w-4 text-white" strokeWidth={2.5}/>
          </span>
          <span className="text-sm font-semibold text-neutral-900">Quản Lý Lịch Họp</span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold tracking-[0.2em] text-neutral-700 mb-4">
            UI-01 · ĐĂNG NHẬP
          </p>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-neutral-900">
            Quản lý lịch họp <span className="text-[#22b573]">đơn giản</span>, gọn gàng.
          </h1>
          <p className="mt-4 text-sm text-neutral-700 leading-relaxed">
            Lên lịch, mời đồng nghiệp và nhận thông báo realtime từ một
            <br />
            không gian làm việc duy nhất.
          </p>
        </div>

        <div />
      </div>

      {/* Bên này là form đăng nhập */}
      <div className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold text-neutral-900">Chào bạn trở lại</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Đăng nhập bằng tài khoản nội bộ của bạn.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {loginMutation.isError && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {loginMutation.error.message || "Tài khoản hoặc mật khẩu không đúng."}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-800 mb-1.5">
                Tài khoản
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"/>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vu.nguyen@company.vn" className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#22b573] focus:outline-none focus:ring-2 focus:ring-[#22b573]/20"/>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-800">Mật khẩu</label>
                <a href="#" className="text-xs font-medium text-[#22b573] hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"/>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-9 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#22b573] focus:outline-none focus:ring-2 focus:ring-[#22b573]/20"/>
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-[#22b573] focus:ring-[#22b573]"/>
              Ghi nhớ đăng nhập
            </label>

            <button type="submit" disabled={loginMutation.isPending} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#22b573] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1ea366] focus:outline-none focus:ring-2 focus:ring-[#22b573]/40 disabled:opacity-60">
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"} <ArrowRight className="h-4 w-4"/>
            </button>

            <p className="text-center text-sm text-neutral-500">
              Chưa có tài khoản?{" "}
              <a href="#" className="font-medium text-[#22b573] hover:underline">
                Liên hệ bộ phận hỗ trợ
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>);
}
