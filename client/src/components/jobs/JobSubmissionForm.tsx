import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface JobDefinition {
  job_id: number
  job_name: string
  description: string | null
  created_time: string
  creator_user_name: string | null
}

interface Cluster {
  cluster_id: string
  cluster_name: string
  state: string
  node_type_id: string
  num_workers: number | null
}

interface JobSubmissionFormProps {
  jobDefinitions: JobDefinition[]
  clusters: Cluster[]
  onSubmit: (jobId: number, clusterId?: string) => void
  isSubmitting: boolean
}

export function JobSubmissionForm({ 
  jobDefinitions, 
  clusters, 
  onSubmit, 
  isSubmitting 
}: JobSubmissionFormProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [selectedClusterId, setSelectedClusterId] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedJobId) {
      onSubmit(
        parseInt(selectedJobId), 
        selectedClusterId || undefined
      )
    }
  }

  // Filter running clusters for job submission
  const runningClusters = clusters.filter(cluster => 
    cluster.state.toUpperCase() === 'RUNNING'
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Job</CardTitle>
        <CardDescription>
          Select a job definition and optionally choose a cluster to run it on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="job-select" className="text-sm font-medium">
              Job Definition
            </label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job to run" />
              </SelectTrigger>
              <SelectContent>
                {jobDefinitions.map((job) => (
                  <SelectItem key={job.job_id} value={job.job_id.toString()}>
                    <div className="flex flex-col">
                      <span>{job.job_name}</span>
                      {job.description && (
                        <span className="text-xs text-gray-500 truncate max-w-xs">
                          {job.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="cluster-select" className="text-sm font-medium">
              Cluster (Optional)
            </label>
            <Select value={selectedClusterId} onValueChange={setSelectedClusterId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a cluster (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Use job's default cluster</SelectItem>
                {runningClusters.map((cluster) => (
                  <SelectItem key={cluster.cluster_id} value={cluster.cluster_id}>
                    <div className="flex flex-col">
                      <span>{cluster.cluster_name}</span>
                      <span className="text-xs text-gray-500">
                        {cluster.node_type_id} • {cluster.num_workers || 0} workers
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={!selectedJobId || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Submitting..." : "Submit Job"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}