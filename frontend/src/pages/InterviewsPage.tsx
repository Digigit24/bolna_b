import { useQuery } from '@tanstack/react-query'
import { Calendar } from 'lucide-react'
import { getInterviews } from '@/api/endpoints'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

export default function InterviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => getInterviews().then((r) => r.data),
  })

  const interviews = data?.results ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {interviews.length} scheduled
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job</TableHead>
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
                    <TableCell className="font-medium">{i.candidate_name}</TableCell>
                    <TableCell className="text-gray-600">{i.job_title}</TableCell>
                    <TableCell>
                      <Badge variant="default">{i.interview_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(i.status)}>{i.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{formatDate(i.scheduled_at)}</TableCell>
                    <TableCell className="text-gray-600">{i.interviewer_name || '-'}</TableCell>
                    <TableCell>{i.rating ?? '-'}</TableCell>
                  </TableRow>
                ),
              )}
              {interviews.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    No interviews scheduled
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
