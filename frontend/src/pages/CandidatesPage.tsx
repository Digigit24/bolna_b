import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Phone, Plus, Search } from 'lucide-react'
import { getCandidates, startCall, createCandidate } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" /> Add Candidate
        </Button>
      </div>

      {/* Add form (toggleable) */}
      {showAddForm && <AddCandidateForm onClose={() => setShowAddForm(false)} />}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-gray-300 px-3 text-sm bg-white"
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
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
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
                      <div>
                        <p className="font-medium text-gray-900">{c.name}</p>
                        <p className="text-xs text-gray-500">
                          {(c.skills || []).slice(0, 3).join(', ')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{c.job_title}</TableCell>
                    <TableCell className="text-gray-600">{c.phone}</TableCell>
                    <TableCell>{c.experience_years} yrs</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callMutation.mutate(c.id)}
                        disabled={callMutation.isPending}
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Call
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
              {candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No candidates found
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
    <Card className="mb-4 p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          placeholder="Phone (+1...)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          placeholder="Experience (years)"
          type="number"
          value={form.experience_years}
          onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })}
        />
        <Input
          placeholder="Job ID (UUID)"
          value={form.job}
          onChange={(e) => setForm({ ...form, job: e.target.value })}
          required
        />
        <Input
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />
        <div className="col-span-2 flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Add Candidate'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
