import { useQuery } from '@tanstack/react-query'
import { Calendar, Star } from 'lucide-react'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Interviews</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Scheduled interviews for qualified candidates
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[13px] shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-700">{interviews.length}</span>
          <span className="text-slate-400">scheduled</span>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
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
                    <TableCell className="text-[13px] font-semibold text-slate-900">
                      {i.candidate_name}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {i.job_title || <span className="text-slate-300">--</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className="capitalize">{i.interview_type.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(i.status)} className="capitalize">{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-500">
                      {formatDate(i.scheduled_at)}
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {i.interviewer_name || <span className="text-slate-300">--</span>}
                    </TableCell>
                    <TableCell>
                      {i.rating != null ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-[13px] font-semibold text-slate-700">{i.rating}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">No interviews scheduled</p>
            <p className="mt-1 text-xs text-slate-400">
              Interviews will appear here when candidates are qualified
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
