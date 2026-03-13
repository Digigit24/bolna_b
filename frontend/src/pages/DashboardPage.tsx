import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
import { getDashboard } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    refetchInterval: 30000,
    retry: 2,
  })

  const calls = data?.calls ?? {}
  const candidates = data?.candidates ?? {}
  const jobs = data?.jobs ?? {}
  const pipeline = candidates.pipeline ?? {}

  const stats = [
    { label: 'Calls Today', value: calls.today ?? 0, icon: Phone, bg: 'bg-indigo-50', fg: 'text-indigo-600' },
    { label: 'Connected', value: calls.connected ?? 0, icon: CheckCircle, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    { label: 'Qualified', value: candidates.qualified ?? 0, icon: Users, bg: 'bg-violet-50', fg: 'text-violet-600' },
    { label: 'Active Jobs', value: jobs.active ?? 0, icon: Briefcase, bg: 'bg-amber-50', fg: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Compact greeting */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Welcome back, {user?.first_name || user?.username || 'Admin'}
        </h2>
        <p className="text-sm text-slate-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Error banner if API failed */}
      {isError && (
        <ErrorState
          compact
          title="Could not fetch dashboard data — showing default values"
          onRetry={() => refetch()}
        />
      )}

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-5">
              <div className="skeleton mb-3 h-4 w-20" />
              <div className="skeleton h-7 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, bg, fg }) => (
            <Card key={label} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{label}</p>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
                    <Icon className={`h-4 w-4 ${fg}`} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Avg Duration', value: calls.avg_duration ? `${calls.avg_duration}s` : '0s', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg AI Score', value: calls.avg_ai_score ?? 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Calls', value: calls.total ?? 0, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-bold tracking-tight text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Candidate Pipeline</CardTitle>
          {Object.keys(pipeline).length > 0 && (
            <span className="text-xs text-slate-400">{Object.values(pipeline).reduce((a: number, b) => a + (b as number), 0)} total</span>
          )}
        </CardHeader>
        <CardContent>
          {Object.keys(pipeline).length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(pipeline).map(([status, count]) => (
                <div key={status} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 text-center">
                  <Badge variant={statusVariant(status)} className="capitalize">{status}</Badge>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{count as number}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-600">No candidates in pipeline yet</p>
              <p className="mt-1 text-xs text-slate-400">Add candidates and start making calls to populate your pipeline</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
