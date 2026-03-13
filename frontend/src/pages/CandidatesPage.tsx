import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Plus, Search, Users } from 'lucide-react'
import { getCandidates, startCall, createCandidate, getJobs } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table'

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['candidates', search, statusFilter],
    queryFn: () =>
      getCandidates({
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      }).then((r) => r.data),
  })

  const callMutation = useMutation({
    mutationFn: (candidateId: string) => startCall({ candidate_id: candidateId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidates'] }),
  })

  const candidates = data?.results ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} in your pipeline
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 pr-8 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="screening">Screening</option>
          <option value="qualified">Qualified</option>
          <option value="rejected">Rejected</option>
          <option value="hired">Hired</option>
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : candidates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map(
                (c: {
                  id: string
                  name: string
                  job_title: string
                  phone: string
                  experience_years: number
                  status: string
                  skills: string[]
                }) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600">
                          {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-slate-900">{c.name}</p>
                          {c.skills?.length > 0 && (
                            <p className="truncate text-[11px] text-slate-400">
                              {c.skills.slice(0, 3).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {c.job_title || <span className="text-slate-300">--</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">{c.phone}</TableCell>
                    <TableCell className="text-[13px]">
                      {c.experience_years > 0 ? `${c.experience_years} yrs` : <span className="text-slate-300">--</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.status)} className="capitalize">{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callMutation.mutate(c.id)}
                        disabled={callMutation.isPending}
                      >
                        <Phone className="h-3 w-3" />
                        Call
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">No candidates found</p>
            <p className="mt-1 text-xs text-slate-400">Add your first candidate to get started</p>
            <Button className="mt-4" size="sm" onClick={() => setShowModal(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Candidate
            </Button>
          </div>
        )}
      </Card>

      {/* Add Candidate Modal */}
      <AddCandidateModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function AddCandidateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    experience_years: 0,
    job: '',
    skills: '',
  })

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
    mutation.mutate({
      ...form,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Candidate" description="Fill in the details below to add a candidate to your pipeline.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Phone <span className="text-red-500">*</span></label>
            <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Email</label>
            <Input placeholder="john@example.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Experience</label>
            <Input type="number" min={0} placeholder="Years" value={form.experience_years || ''} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700">Position <span className="text-red-500">*</span></label>
          <select
            value={form.job}
            onChange={(e) => setForm({ ...form, job: e.target.value })}
            required
            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">Select a job position</option>
            {jobs.map((j: { id: string; title: string }) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700">Skills</label>
          <Input placeholder="Python, React, Django (comma-separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Add Candidate'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
