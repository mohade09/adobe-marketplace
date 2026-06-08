import { Badge } from "@/components/ui/badge";
import type { RequestStatus } from "@/types";

const STYLES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  approved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  denied: "bg-red-100 text-red-800 hover:bg-red-100",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant="secondary" className={STYLES[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
