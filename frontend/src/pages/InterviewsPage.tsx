import { useQuery } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { getInterviews } from '@/api/endpoints'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

export default function InterviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => getInterviews().then((r) => r.data),
  })

  const interviews = data?.results ?? []

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Interviews</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scheduled interviews for qualified candidates
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700">{interviews.length}</span> scheduled
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : interviews.length > 0 ? (
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
              {interviews.map(
                (i: {
                  id: string
                  candidate_name: string
                  job_title: string
                  interview_type: string
                  status: string
                  scheduled_at: string
                  interviewer_name: string
                  rating: number | null
                }) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium text-slate-900">
                      {i.candidate_name}
                    </TableCell>
                    <TableCell>{i.job_title || <span className="text-slate-400">-</span>}</TableCell>
                    <TableCell>
                      <Badge>{i.interview_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(i.status)}>{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDate(i.scheduled_at)}
                    </TableCell>
                    <TableCell>{i.interviewer_name || <span className="text-slate-400">-</span>}</TableCell>
                    <TableCell>
                      {i.rating != null ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-xs font-bold text-indigo-700">
                          {i.rating}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No interviews scheduled</p>
            <p className="mt-1 text-xs text-slate-400">
              Interviews appear here when candidates are qualified
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
