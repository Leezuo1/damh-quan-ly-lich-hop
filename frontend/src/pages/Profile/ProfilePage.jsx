import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppSidebar } from "@/layouts/AppLayout/AppSidebar";
import { Save, User, Mail, Briefcase } from "lucide-react";
import { useCurrentUser, useUpdateProfile } from "../../hooks/useUsers";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const auth = useAuth();
  const [form, setForm] = useState({ name: "", position: "" });

  useEffect(() => {
    if (currentUser) {
      setForm({ name: currentUser.name, position: currentUser.position ?? "" });
    }
  }, [currentUser]);

  const onChange = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function onSubmit(e) {
    e.preventDefault();
    updateProfile.mutate(form, {
      onSuccess: (user) => {
        auth.updateUser(user);
        toast.success("Đã lưu thay đổi.");
      },
      onError: (err) => toast.error(err.message || "Không lưu được, thử lại nhé."),
    });
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AppSidebar active={"lich-hop"} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900">Thông tin cá nhân</h1>
          <p className="text-sm text-neutral-500 mt-1">Cập nhật tên và chức danh của bạn.</p>

          {isLoading || !currentUser ? (
            <p className="mt-6 text-sm text-neutral-400">Đang tải...</p>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#22b573] text-white text-2xl font-semibold">
                  {form.name.split(" ").slice(-1)[0]?.[0]?.toUpperCase() ?? "?"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{form.name}</p>
                  <p className="text-xs text-neutral-500">{form.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field icon={<User className="h-4 w-4" />} label="Họ và tên">
                  <input value={form.name} onChange={onChange("name")} className={inputCls} />
                </Field>
                <Field icon={<Mail className="h-4 w-4" />} label="Email">
                  <input
                    value={currentUser.email}
                    disabled
                    className={`${inputCls} bg-neutral-50 text-neutral-400`}
                  />
                </Field>
                <Field icon={<Briefcase className="h-4 w-4" />} label="Chức danh">
                  <input value={form.position} onChange={onChange("position")} className={inputCls} />
                </Field>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">Thông tin sẽ được cập nhật ngay lập tức.</span>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#22b573] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1ea366] disabled:opacity-60"
                >
                  <Save className="h-4 w-4" /> {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
const inputCls = "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#22b573]/30 focus:border-[#22b573]";
function Field({ icon, label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-700 mb-1 flex items-center gap-1.5">
        <span className="text-neutral-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
