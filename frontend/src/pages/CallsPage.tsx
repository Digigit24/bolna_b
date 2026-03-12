import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Phone, FileText, X } from 'lucide-react'
import { getCalls, getCallTranscript } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Phone className="h-4 w-4" />
          {calls.length} calls
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call list */}
        <div className="lg:col-span-2">
          <Card>
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
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
                        className={selectedCallId === call.id ? 'bg-blue-50' : ''}
                      >
                        <TableCell className="font-medium">{call.candidate_name}</TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(call.status)}>{call.status}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {call.duration ? formatDuration(call.duration) : '-'}
                        </TableCell>
                        <TableCell>
                          {call.ai_score != null ? (
                            <span
                              className={
                                call.ai_score >= 70
                                  ? 'text-green-600 font-semibold'
                                  : call.ai_score >= 40
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }
                            >
                              {call.ai_score}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">
                          {formatDate(call.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedCallId(call.id)}
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                  {calls.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No calls yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {/* Call detail panel */}
        <div className="lg:col-span-1">
          {selectedCallId ? (
            <CallDetailPanel callId={selectedCallId} onClose={() => setSelectedCallId(null)} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Select a call to view details</p>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Call Details</CardTitle>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Candidate</p>
              <p className="font-medium">{data.candidate_name}</p>
            </div>

            {data.ai_score != null && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">AI Score</p>
                <p className="text-2xl font-bold text-blue-600">{data.ai_score}/100</p>
              </div>
            )}

            {data.recording_url && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recording</p>
                <audio controls className="w-full" src={data.recording_url}>
                  Your browser does not support audio.
                </audio>
              </div>
            )}

            {data.summary && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">AI Summary</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{data.summary}</p>
              </div>
            )}

            {data.transcript && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transcript</p>
                <div className="bg-gray-50 rounded-lg p-3 max-h-80 overflow-y-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-line">{data.transcript}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
