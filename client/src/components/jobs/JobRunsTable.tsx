import { formatDistanceToNow, format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "./StatusBadge"

interface JobRun {
  run_id: number
  job_id: number
  job_name: string
  status: string
  start_time: string | null
  end_time: string | null
  cluster_id: string | null
  cluster_name: string | null
  run_duration: number | null
}

interface JobRunsTableProps {
  jobRuns: JobRun[]
  isLoading: boolean
}

export function JobRunsTable({ jobRuns, isLoading }: JobRunsTableProps) {
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return format(new Date(dateString), "MMM d, h:mm a")
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (jobRuns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No job runs found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Run ID</TableHead>
          <TableHead>Job Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Cluster</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobRuns.map((run) => (
          <TableRow key={run.run_id}>
            <TableCell className="font-mono text-sm">
              {run.run_id}
            </TableCell>
            <TableCell className="max-w-xs truncate" title={run.job_name}>
              {run.job_name}
            </TableCell>
            <TableCell>
              <StatusBadge status={run.status} />
            </TableCell>
            <TableCell>
              {formatDateTime(run.start_time)}
            </TableCell>
            <TableCell>
              {formatDateTime(run.end_time)}
            </TableCell>
            <TableCell>
              {formatDuration(run.run_duration)}
            </TableCell>
            <TableCell>
              {run.cluster_name || run.cluster_id || "N/A"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}