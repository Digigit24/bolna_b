import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Briefcase, Trash2, X } from 'lucide-react'
import { getJobs, createJob, deleteJob } from '@/api/endpoints'
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
import { formatDate } from '@/lib/utils'

export default function JobsPage() {
  const [showForm, setShowForm] = useState(false)
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your open positions</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> New Job
        </Button>
      </div>

      {/* Add form */}
      {showForm && <AddJobForm onClose={() => setShowForm(false)} />}

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : jobs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
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
                        <p className="font-medium text-slate-900">{j.title}</p>
                        {j.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">
                            {j.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(j.status)}>{j.status}</Badge>
                    </TableCell>
                    <TableCell>{j.location || <span className="text-slate-400">-</span>}</TableCell>
                    <TableCell className="text-slate-500">{formatDate(j.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this job?'))
                            deleteMutation.mutate(j.id)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="py-16 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No jobs posted yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Create your first job posting to start hiring
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}

function AddJobForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      onClose()
    },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Create New Job</CardTitle>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate(form)
          }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Job Title</label>
            <Input
              placeholder="Senior Software Engineer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Location</label>
            <Input
              placeholder="Remote / New York, NY"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="col-span-full space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <Input
              placeholder="Brief description of the role..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="col-span-full space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Requirements</label>
            <Input
              placeholder="Key requirements for the position..."
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />
          </div>
          <div className="col-span-full flex items-center gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Job'}
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
