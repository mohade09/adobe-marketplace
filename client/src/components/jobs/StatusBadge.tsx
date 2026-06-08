import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'TERMINATED':
      case 'SUCCEEDED':
        return 'default' // Green
      case 'RUNNING':
      case 'PENDING':
        return 'secondary' // Blue
      case 'FAILED':
      case 'CANCELLED':
        return 'destructive' // Red
      default:
        return 'outline' // Gray
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toUpperCase()) {
      case 'TERMINATED':
        return 'Success'
      case 'RUNNING':
        return 'Running'
      case 'PENDING':
        return 'Pending'
      case 'FAILED':
        return 'Failed'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  return (
    <Badge variant={getStatusVariant(status)}>
      {getStatusDisplay(status)}
    </Badge>
  )
}