import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Plus, Search, Users, Eye, Calendar } from 'lucide-react'
import { getCandidates, startCall, createCandidate, getJobs } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/Table'

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [callFeedback, setCallFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['candidates', search, statusFilter],
    queryFn: () =>
      getCandidates({
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      }).then((r) => r.data),
    retry: 2,
  })

  const callMutation = useMutation({
    mutationFn: (candidateId: string) => startCall({ candidate_id: candidateId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      queryClient.invalidateQueries({ queryKey: ['calls'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setCallFeedback({ type: 'success', message: 'Call queued successfully. The AI agent will call the candidate shortly.' })
      setTimeout(() => setCallFeedback(null), 5000)
    },
    onError: () => {
      setCallFeedback({ type: 'error', message: 'Failed to initiate call. Please try again.' })
      setTimeout(() => setCallFeedback(null), 5000)
    },
  })

  const candidates = data?.results ?? []

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{isError ? 'Unable to load count' : `${data?.count ?? candidates.length} total candidates`}</p>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus className="h-3.5 w-3.5" /> Add Candidate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-[13px]" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 pr-8 text-[13px] text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="screening">Screening</option>
            <option value="qualified">Qualified</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </CardContent>
      </Card>

      {/* Call feedback */}
      {callFeedback && (
        <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
          callFeedback.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          <span>{callFeedback.message}</span>
          <button onClick={() => setCallFeedback(null)} className="ml-auto text-current opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="space-y-3 p-6">
            <div className="skeleton h-10 w-full" />
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-14 w-full" style={{ opacity: 1 - i * 0.12 }} />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              title="Failed to load candidates"
              message="The server may be unavailable. Please ensure the backend is running and try again."
              onRetry={() => refetch()}
            />
          </div>
        ) : candidates.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map(
                  (c: {
                    id: string; name: string; job_title: string; phone: string;
                    experience_years: number; status: string; skills: string[]
                  }) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-[10px] font-bold text-indigo-700">
                            {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                            {c.skills?.length > 0 && (
                              <p className="truncate text-xs text-slate-400">{c.skills.slice(0, 3).join(', ')}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.job_title || '--'}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">{c.phone}</TableCell>
                      <TableCell className="text-sm">{c.experience_years > 0 ? `${c.experience_years} yrs` : '--'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(c.status)} className="capitalize">{c.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" onClick={() => callMutation.mutate(c.id)} disabled={callMutation.isPending} title="Call Candidate">
                            <Phone className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" title="View Transcript">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" title="Schedule Interview">
                            <Calendar className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No candidates found"
            description="Add your first candidate to get started with AI-powered screening calls."
            action={{ label: 'Add Candidate', onClick: () => setShowModal(true), icon: <Plus className="h-3.5 w-3.5" /> }}
          />
        )}
      </Card>

      <AddCandidateModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function AddCandidateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', phone: '', email: '', experience_years: 0, job: '', skills: '' })

  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs().then((r) => r.data),
    enabled: open,
  })
  const jobs = jobsData?.results ?? []

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      setForm({ name: '', phone: '', email: '', experience_years: 0, job: '', skills: '' })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.job) return
    mutation.mutate({
      ...form,
      job: form.job || null,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Candidate" description="Fill in the candidate details below.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {(() => {
              const errData = (mutation.error as { response?: { data?: Record<string, string[]> } })?.response?.data
              if (errData && typeof errData === 'object') {
                return Object.entries(errData).map(([field, msgs]) => (
                  <div key={field}><strong className="capitalize">{field}:</strong> {Array.isArray(msgs) ? msgs.join(', ') : String(msgs)}</div>
                ))
              }
              return 'Failed to add candidate. Please check your input and try again.'
            })()}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone <span className="text-red-500">*</span></label>
            <Input placeholder="+1 555 000 0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <Input placeholder="john@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Experience (years)</label>
            <Input type="number" min={0} placeholder="0" value={form.experience_years || ''} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Position <span className="text-red-500">*</span></label>
          <select
            value={form.job}
            onChange={(e) => setForm({ ...form, job: e.target.value })}
            required
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="">Select a position</option>
            {jobs.map((j: { id: string; title: string }) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Skills</label>
          <Input placeholder="Python, React, Django (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Add Candidate'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
