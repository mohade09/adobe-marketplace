import { Link } from "react-router-dom";
import { format } from "date-fns";
import { AppNavbar } from "@/components/marketplace/AppNavbar";
import { RequestStatusBadge } from "@/components/marketplace/RequestStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyRequests } from "@/hooks/useMarketplace";

export function MyRequestsPage() {
  const { data: requests = [], isLoading } = useMyRequests();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
            <p className="text-sm text-gray-600">
              Track access requests submitted to domain teams.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Browse catalog</Link>
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="mb-4 text-gray-600">You have not submitted any requests yet.</p>
            <Button asChild className="bg-[#EB1000] hover:bg-[#c40d00]">
              <Link to="/">Find a data product</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Use case</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.request_id}>
                    <TableCell className="font-medium">
                      <Link
                        to={`/products/${request.product_id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {request.product_title}
                      </Link>
                    </TableCell>
                    <TableCell>{request.domain}</TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600">
                      {request.use_case || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
