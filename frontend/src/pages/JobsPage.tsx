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
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { formatDate } from '@/lib/utils'

export default function JobsPage() {
  const [showModal, setShowModal] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs().then((r) => r.data),
    retry: 2,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
  })

  const jobs = data?.results ?? []

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{isError ? 'Unable to load' : `${data?.count ?? jobs.length} positions`}</p>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus className="h-3.5 w-3.5" /> New Job
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="space-y-3 p-6">
            <div className="skeleton h-10 w-full" />
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" style={{ opacity: 1 - i * 0.2 }} />)}
          </div>
        ) : isError ? (
          <div className="p-6">
            <ErrorState
              title="Failed to load jobs"
              message="The server may be unavailable. Please ensure the backend is running and try again."
              onRetry={() => refetch()}
            />
          </div>
        ) : jobs.length > 0 ? (
          <div className="overflow-x-auto">
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
                {jobs.map((j: { id: string; title: string; status: string; location: string; created_at: string; description: string }) => (
                  <TableRow key={j.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                          <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{j.title}</p>
                          {j.description && <p className="mt-0.5 max-w-md truncate text-xs text-slate-400">{j.description}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={statusVariant(j.status)} className="capitalize">{j.status}</Badge></TableCell>
                    <TableCell>
                      {j.location ? (
                        <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3 w-3" />{j.location}</span>
                      ) : <span className="text-sm text-slate-400">--</span>}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(j.created_at)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => { if (confirm('Delete this job?')) deleteMutation.mutate(j.id) }}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No jobs posted"
            description="Create your first job posting to start receiving AI-screened candidates."
            action={{ label: 'New Job', onClick: () => setShowModal(true), icon: <Plus className="h-3.5 w-3.5" /> }}
          />
        )}
      </Card>

      <CreateJobModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

function CreateJobModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '' })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createJob(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['jobs'] }); setForm({ title: '', description: '', requirements: '', location: '' }); onClose() },
  })

  return (
    <Modal open={open} onClose={onClose} title="Create Job" description="Define the position details.">
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-4">
        {mutation.isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to create job. Please try again.
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Job Title <span className="text-red-500">*</span></label>
            <Input placeholder="Senior Software Engineer" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
            <Input placeholder="Remote / NYC" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
          <Textarea placeholder="Describe the role..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Requirements</label>
          <Textarea placeholder="Key qualifications..." value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create Job'}</Button>
        </div>
      </form>
    </Modal>
  )
}
