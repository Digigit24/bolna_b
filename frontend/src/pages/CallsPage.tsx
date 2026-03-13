import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, FileText, X, Headphones } from 'lucide-react'
import { getCalls, getCallTranscript } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'
import { formatDate, formatDuration } from '@/lib/utils'

export default function CallsPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['calls'],
    queryFn: () => getCalls().then((r) => r.data),
    refetchInterval: 10000,
  })

  const calls = data?.results ?? []

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Call Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and review AI screening calls
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
          <Phone className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700">{calls.length}</span> calls
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Call list */}
        <div className="lg:col-span-2">
          <Card>
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : calls.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map(
                    (call: {
                      id: string
                      candidate_name: string
                      status: string
                      duration: number
                      ai_score: number | null
                      created_at: string
                    }) => (
                      <TableRow
                        key={call.id}
                        className={
                          selectedCallId === call.id
                            ? 'bg-indigo-50/60 hover:bg-indigo-50/60'
                            : 'cursor-pointer'
                        }
                        onClick={() => setSelectedCallId(call.id)}
                      >
                        <TableCell className="font-medium text-slate-900">
                          {call.candidate_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(call.status)}>{call.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {call.duration ? formatDuration(call.duration) : '-'}
                        </TableCell>
                        <TableCell>
                          {call.ai_score != null ? (
                            <span
                              className={`inline-flex h-7 w-10 items-center justify-center rounded-md text-xs font-bold ${
                                call.ai_score >= 70
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : call.ai_score >= 40
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {call.ai_score}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatDate(call.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCallId(call.id)
                            }}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="py-16 text-center">
                <Phone className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">No calls yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Start a call from the Candidates page
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Call detail panel */}
        <div className="lg:col-span-1">
          {selectedCallId ? (
            <CallDetailPanel
              callId={selectedCallId}
              onClose={() => setSelectedCallId(null)}
            />
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Headphones className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-500">
                  Select a call to view details
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Click on any row to see the transcript and AI analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CallDetailPanel({
  callId,
  onClose,
}: {
  callId: string
  onClose: () => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['call-transcript', callId],
    queryFn: () => getCallTranscript(callId).then((r) => r.data),
  })

  return (
    <Card className="sticky top-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Call Details</CardTitle>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Candidate
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {data.candidate_name}
              </p>
            </div>

            {data.ai_score != null && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Score
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-indigo-600">{data.ai_score}</span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      data.ai_score >= 70
                        ? 'bg-emerald-500'
                        : data.ai_score >= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${data.ai_score}%` }}
                  />
                </div>
              </div>
            )}

            {data.recording_url && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recording
                </p>
                <audio controls className="w-full" src={data.recording_url}>
                  Your browser does not support audio.
                </audio>
              </div>
            )}

            {data.summary && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Summary
                </p>
                <p className="text-sm leading-relaxed text-slate-600">{data.summary}</p>
              </div>
            )}

            {data.transcript && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Transcript
                </p>
                <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {data.transcript}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
