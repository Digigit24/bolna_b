import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
import { getDashboard } from '@/api/endpoints'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, statusVariant } from '@/components/ui/Badge'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const calls = data?.calls ?? {}
  const candidates = data?.candidates ?? {}
  const jobs = data?.jobs ?? {}
  const pipeline = candidates.pipeline ?? {}

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of your hiring pipeline and call activity</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Calls Today"
          value={calls.today ?? 0}
          icon={<Phone className="h-5 w-5" />}
        />
        <StatCard
          title="Connected"
          value={calls.connected ?? 0}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Qualified Candidates"
          value={candidates.qualified ?? 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Active Jobs"
          value={jobs.active ?? 0}
          icon={<Briefcase className="h-5 w-5" />}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          title="Avg Call Duration"
          value={`${calls.avg_duration ?? 0}s`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Avg AI Score"
          value={calls.avg_ai_score ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Total Calls"
          value={calls.total ?? 0}
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Candidate pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(pipeline).length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(pipeline).map(([status, count]) => (
                <div
                  key={status}
                  className="flex flex-col items-center rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                >
                  <Badge variant={statusVariant(status)} className="mb-2">
                    {status}
                  </Badge>
                  <span className="text-2xl font-bold text-slate-900">{count as number}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No candidates in the pipeline yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
