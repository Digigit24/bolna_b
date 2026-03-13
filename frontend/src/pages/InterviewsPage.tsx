import { useQuery } from '@tanstack/react-query'
import { Calendar, Star } from 'lucide-react'
import { getInterviews } from '@/api/endpoints'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

export default function InterviewsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => getInterviews().then((r) => r.data),
    retry: 2,
  })
  const interviews = data?.results ?? []

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Interviews</h2>
        <p className="text-sm text-slate-500">{isError ? 'Unable to load' : `${data?.count ?? interviews.length} scheduled`}</p>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-6">
            <div className="skeleton h-11 w-full" />
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" style={{ opacity: 1 - i * 0.2 }} />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              title="Failed to load interviews"
              message="The server may be unavailable. Please ensure the backend is running and try again."
              onRetry={() => refetch()}
            />
          </div>
        ) : interviews.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Interviewer</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interviews.map((i: { id: string; candidate_name: string; job_title: string; interview_type: string; status: string; scheduled_at: string; interviewer_name: string; rating: number | null }) => (
                  <TableRow key={i.id}>
                    <TableCell className="text-sm font-medium text-slate-900">{i.candidate_name}</TableCell>
                    <TableCell className="text-sm">{i.job_title || '--'}</TableCell>
                    <TableCell><Badge className="capitalize">{i.interview_type.replace('_', ' ')}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant(i.status)} className="capitalize">{i.status}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(i.scheduled_at)}</TableCell>
                    <TableCell className="text-sm">{i.interviewer_name || '--'}</TableCell>
                    <TableCell>
                      {i.rating != null ? (
                        <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /><span className="text-sm font-semibold">{i.rating}</span></div>
                      ) : <span className="text-sm text-slate-400">--</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No interviews scheduled"
            description="Interviews will appear here once you schedule them from the Candidates page."
          />
        )}
      </Card>
    </div>
  )
}
