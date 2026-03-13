import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, X, Headphones } from 'lucide-react'
import { getCalls, getCallTranscript } from '@/api/endpoints'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatDate, formatDuration } from '@/lib/utils'

export default function CallsPage() {
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['calls'],
    queryFn: () => getCalls().then((r) => r.data),
    refetchInterval: 10000,
    retry: 2,
  })

  const calls = data?.results ?? []

  return (
    <div className="space-y-6 fade-in">
      <div>
        <p className="text-sm text-slate-500">{isError ? 'Unable to load' : `${data?.count ?? calls.length} total calls`}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Call list */}
        <div className="lg:col-span-3">
          <Card>
            {isLoading ? (
              <div className="space-y-3 p-6">
                <div className="skeleton h-10 w-full" />
                {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14 w-full" style={{ opacity: 1 - i * 0.15 }} />)}
              </div>
            ) : isError ? (
              <div className="p-6">
                <ErrorState
                  title="Failed to load calls"
                  message="The server may be unavailable. Please ensure the backend is running and try again."
                  onRetry={() => refetch()}
                />
              </div>
            ) : calls.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call: { id: string; candidate_name: string; status: string; duration: number; ai_score: number | null; created_at: string }) => (
                      <TableRow
                        key={call.id}
                        onClick={() => setSelectedCallId(call.id)}
                        className={`cursor-pointer ${selectedCallId === call.id ? 'bg-indigo-50/70 ring-1 ring-inset ring-indigo-100' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <Phone className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-900">{call.candidate_name}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant={statusVariant(call.status)} className="capitalize">{call.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{call.duration ? formatDuration(call.duration) : '--'}</TableCell>
                        <TableCell>
                          {call.ai_score != null ? (
                            <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${
                              call.ai_score >= 70 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : call.ai_score >= 40 ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                            }`}>{call.ai_score}</span>
                          ) : <span className="text-sm text-slate-400">--</span>}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">{formatDate(call.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={Phone}
                title="No calls yet"
                description="Start calling candidates from the Candidates page to see call records here."
              />
            )}
          </Card>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selectedCallId ? (
            <CallDetail callId={selectedCallId} onClose={() => setSelectedCallId(null)} />
          ) : (
            <Card>
              <CardContent className="py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <Headphones className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-600">Call Details</p>
                <p className="mt-1 text-xs text-slate-400">Select a call to view transcript and score</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function CallDetail({ callId, onClose }: { callId: string; onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['call-transcript', callId],
    queryFn: () => getCallTranscript(callId).then((r) => r.data),
    retry: 1,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Call Details</CardTitle>
        <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"><X className="h-4 w-4" /></button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-14 w-full" />
            <div className="skeleton h-20 w-full" />
          </div>
        ) : isError ? (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-500">Could not load call details</p>
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Candidate</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{data.candidate_name}</p>
            </div>
            {data.ai_score != null && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">AI Score</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{data.ai_score}<span className="text-sm text-slate-400">/100</span></p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all ${data.ai_score >= 70 ? 'bg-emerald-500' : data.ai_score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${data.ai_score}%` }} />
                </div>
              </div>
            )}
            {data.recording_url && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">Recording</p>
                <audio controls className="w-full" src={data.recording_url} />
              </div>
            )}
            {data.summary && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">Summary</p>
                <p className="text-sm leading-relaxed text-slate-600">{data.summary}</p>
              </div>
            )}
            {data.transcript && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">Transcript</p>
                <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{data.transcript}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-slate-400">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
