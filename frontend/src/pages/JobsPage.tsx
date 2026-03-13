import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Briefcase, Trash2, MapPin } from 'lucide-react'
import { getJobs, createJob, deleteJob } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
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
import { formatDate } from '@/lib/utils'

export default function JobsPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs().then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })

  const jobs = data?.results ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Job Positions</h1>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {jobs.length} position{jobs.length !== 1 ? 's' : ''} posted
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          New Job
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Posted</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(
                (j: {
                  id: string
                  title: string
                  status: string
                  location: string
                  created_at: string
                  description: string
                }) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900">{j.title}</p>
                        {j.description && (
                          <p className="mt-0.5 max-w-md truncate text-[11px] text-slate-400">
                            {j.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(j.status)} className="capitalize">{j.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {j.location ? (
                        <span className="flex items-center gap-1 text-[13px] text-slate-500">
                          <MapPin className="h-3 w-3" />
                          {j.location}
                        </span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[13px] text-slate-500">
                      {formatDate(j.created_at)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          if (confirm('Delete this job posting?'))
                            deleteMutation.mutate(j.id)
                        }}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Briefcase className="h-6 w-6 text-slate-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-600">No jobs posted yet</p>
            <p className="mt-1 text-xs text-slate-400">Create your first position to start hiring</p>
            <Button className="mt-4" size="sm" onClick={() => setShowModal(true)}>
              <Plus className="h-3.5 w-3.5" /> New Job
            </Button>
          </div>
        )}
      </Card>

      {/* Create Job Modal */}
      <CreateJobModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function CreateJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '' })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      setForm({ title: '', description: '', requirements: '', location: '' })
      onClose()
    },
  })

  return (
    <Modal open={open} onClose={onClose} title="Create Job Position" description="Define the role details to start receiving candidates.">
      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Job Title <span className="text-red-500">*</span></label>
            <Input placeholder="Senior Software Engineer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-slate-700">Location</label>
            <Input placeholder="Remote / New York, NY" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700">Description</label>
          <Textarea placeholder="Describe the role, responsibilities, and what the ideal candidate looks like..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-slate-700">Requirements</label>
          <Textarea placeholder="List the key qualifications, skills, and experience needed..." value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Job'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
