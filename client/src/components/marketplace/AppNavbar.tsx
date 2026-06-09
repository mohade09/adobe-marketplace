import { Link, useLocation } from "react-router-dom";
import { usePendingRequestCount, useUser } from "@/hooks/useMarketplace";

export function AppNavbar() {
  const location = useLocation();
  const { data: user } = useUser();
  const { data: pendingCount = 0 } = usePendingRequestCount();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#EB1000] text-sm font-bold text-white">
              A
            </div>
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-900">
              Adobe Data Marketplace
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              to="/"
              className={
                location.pathname === "/"
                  ? "font-medium text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              Marketplace
            </Link>
            <Link
              to="/requests"
              className={
                location.pathname === "/requests"
                  ? "font-medium text-gray-900"
                  : "text-gray-500 hover:text-gray-900"
              }
            >
              <span className="inline-flex items-center gap-2">
                Requests
                {pendingCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                    {pendingCount}
                  </span>
                )}
              </span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EB1000] text-xs font-semibold text-white">
            {user?.initials ?? "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
