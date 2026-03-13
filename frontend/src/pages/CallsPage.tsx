import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, FileText, X, Headphones, Play } from 'lucide-react'
import { getCalls, getCallTranscript } from '@/api/endpoints'
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

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
      : score >= 40 ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
        : 'bg-red-50 text-red-700 ring-red-600/20'
  return (
    <span className={`inline-flex h-7 min-w-[36px] items-center justify-center rounded-md text-xs font-bold ring-1 ring-inset ${color}`}>
      {score}
    </span>
  )
}

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Call Logs</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Monitor and review AI screening calls in real-time
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[13px] shadow-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="font-medium text-slate-700">{calls.length}</span>
          <span className="text-slate-400">calls</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Call list */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="space-y-3 p-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : calls.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
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
                        onClick={() => setSelectedCallId(call.id)}
                        className={`cursor-pointer ${selectedCallId === call.id ? 'bg-indigo-50/70 hover:bg-indigo-50/70' : ''}`}
                      >
                        <TableCell className="text-[13px] font-semibold text-slate-900">
                          {call.candidate_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(call.status)} className="capitalize">{call.status}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {call.duration ? formatDuration(call.duration) : '--'}
                        </TableCell>
                        <TableCell>
                          {call.ai_score != null ? <ScoreBadge score={call.ai_score} /> : <span className="text-slate-300">--</span>}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {formatDate(call.created_at)}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Phone className="h-6 w-6 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">No calls yet</p>
                <p className="mt-1 text-xs text-slate-400">Initiate calls from the Candidates page</p>
              </div>
            )}
          </Card>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selectedCallId ? (
            <CallDetailPanel callId={selectedCallId} onClose={() => setSelectedCallId(null)} />
          ) : (
            <Card>
              <CardContent className="py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Headphones className="h-6 w-6 text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-600">Call Details</p>
                <p className="mt-1 text-xs text-slate-400">
                  Select a call from the list to view<br />transcript and AI analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CallDetailPanel({ callId, onClose }: { callId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['call-transcript', callId],
    queryFn: () => getCallTranscript(callId).then((r) => r.data),
  })

  return (
    <Card className="sticky top-6 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50">
        <CardTitle className="text-[14px]">Call Details</CardTitle>
        <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-5">
            {/* Candidate */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-bold text-slate-600">
                {data.candidate_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-900">{data.candidate_name}</p>
                <p className="text-[11px] text-slate-400">AI Screening Call</p>
              </div>
            </div>

            {/* AI Score */}
            {data.ai_score != null && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Score</p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold tabular-nums text-slate-900">{data.ai_score}</span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      data.ai_score >= 70 ? 'bg-emerald-500' : data.ai_score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.ai_score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recording */}
            {data.recording_url && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recording</p>
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <audio controls className="w-full h-8" src={data.recording_url} />
                </div>
              </div>
            )}

            {/* Summary */}
            {data.summary && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Summary</p>
                <p className="text-[13px] leading-relaxed text-slate-600">{data.summary}</p>
              </div>
            )}

            {/* Transcript */}
            {data.transcript && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Full Transcript</p>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="whitespace-pre-line text-[12px] leading-relaxed text-slate-600">{data.transcript}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
