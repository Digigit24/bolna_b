import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { getJobs, createJob, deleteJob } from '@/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" /> New Job
        </Button>
      </div>

      {showForm && <AddJobForm onClose={() => setShowForm(false)} />}

      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Action</TableHead>
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
                      <div>
                        <p className="font-medium text-gray-900">{j.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{j.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={j.status === 'open' ? 'success' : 'secondary'}>
                        {j.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{j.location || '-'}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(j.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Delete this job?')) deleteMutation.mutate(j.id)
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
              )}
              {jobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No jobs yet
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

function AddJobForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ title: '', description: '', requirements: '', location: '' })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      onClose()
    },
  })

  return (
    <Card className="mb-4 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate(form)
        }}
        className="grid grid-cols-2 gap-4"
      >
        <Input
          placeholder="Job Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <Input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="col-span-2"
        />
        <Input
          placeholder="Requirements"
          value={form.requirements}
          onChange={(e) => setForm({ ...form, requirements: e.target.value })}
          className="col-span-2"
        />
        <div className="col-span-2 flex gap-2">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating...' : 'Create Job'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
