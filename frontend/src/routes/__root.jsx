import { QueryClientProvider } from "@tanstack/react-query";
import { Link, Outlet, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "../context/AuthContext";
function NotFoundComponent() {
    return (<div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Không tìm thấy trang</h2>
        <p className="mt-2 text-sm text-muted-foreground">Trang này không tồn tại hoặc đã được di chuyển.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>);
}
function ErrorComponent({ error, reset }) {
    const router = useRouter();
    return (<div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Trang bị lỗi</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message || "Bạn thử tải lại trang nhé."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => {
            router.invalidate();
            reset();
        }} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Thử lại
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent">
            Về trang chủ
          </a>
        </div>
      </div>
    </div>);
}
export const Route = createRootRouteWithContext()({
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});
function RootComponent() {
    // QueryClient được tạo 1 lần duy nhất ở router.jsx, lấy lại từ router context.
    const { queryClient } = Route.useRouteContext();
    return (<QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Outlet dùng để hiện trang đang được mở. */}
        <Outlet />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>);
}
