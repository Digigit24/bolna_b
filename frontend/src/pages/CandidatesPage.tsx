import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Plus, Search, Users, X } from 'lucide-react'
import { getCandidates, startCall, createCandidate } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidates</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage and screen your candidate pipeline
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4" /> Add Candidate
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddCandidateForm onClose={() => setShowAddForm(false)} />
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <Card>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
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
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {c.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{c.name}</p>
                          {c.skills?.length > 0 && (
                            <p className="truncate text-xs text-slate-400">
                              {c.skills.slice(0, 3).join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{c.job_title || <span className="text-slate-400">-</span>}</TableCell>
                    <TableCell className="font-mono text-xs">{c.phone}</TableCell>
                    <TableCell>
                      {c.experience_years > 0 ? (
                        <span>{c.experience_years} yrs</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callMutation.mutate(c.id)}
                        disabled={callMutation.isPending}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No candidates found</p>
            <p className="mt-1 text-xs text-slate-400">
              Add your first candidate to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

function AddCandidateForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    experience_years: 0,
    job: '',
    skills: '',
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
      onClose()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Add New Candidate</CardTitle>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <Input
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <Input
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              placeholder="john@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Experience (years)</label>
            <Input
              type="number"
              min={0}
              value={form.experience_years}
              onChange={(e) =>
                setForm({ ...form, experience_years: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Job ID</label>
            <Input
              placeholder="Job UUID"
              value={form.job}
              onChange={(e) => setForm({ ...form, job: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Skills</label>
            <Input
              placeholder="Python, React, Django..."
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </div>
          <div className="col-span-full flex items-center gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Candidate'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
