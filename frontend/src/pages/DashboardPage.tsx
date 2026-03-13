import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
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
  const hasData = !!data

  const stats = [
    { label: 'Calls Today', value: calls.today ?? 0, icon: Phone, bg: 'bg-indigo-50', fg: 'text-indigo-600', trend: '+12%' },
    { label: 'Connected', value: calls.connected ?? 0, icon: CheckCircle, bg: 'bg-emerald-50', fg: 'text-emerald-600', trend: '+8%' },
    { label: 'Qualified', value: candidates.qualified ?? 0, icon: Users, bg: 'bg-violet-50', fg: 'text-violet-600', trend: '+24%' },
    { label: 'Active Jobs', value: jobs.active ?? 0, icon: Briefcase, bg: 'bg-amber-50', fg: 'text-amber-600', trend: '0%' },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8">
        <div className="relative z-10">
          <p className="text-sm font-medium text-indigo-200">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Welcome back, {user?.first_name || user?.username || 'Admin'}
          </h2>
          <p className="mt-2 max-w-md text-sm text-indigo-200/80">
            Here&apos;s an overview of your hiring pipeline. Monitor calls, track candidates, and manage your recruitment process.
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-20 top-4 h-20 w-20 rounded-full bg-white/5" />
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="skeleton h-4 w-20 mb-3" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, bg, fg, trend }) => (
            <Card key={label} className="group hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${fg}`} />
                  </div>
                  {hasData && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />
                      {trend}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: 'Avg Duration', value: calls.avg_duration ? `${calls.avg_duration}s` : '0s', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg AI Score', value: calls.avg_ai_score ?? 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Calls', value: calls.total ?? 0, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(pipeline).map(([status, count]) => (
                <div key={status} className="rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/50 p-5 text-center transition-shadow hover:shadow-sm">
                  <Badge variant={statusVariant(status)} className="capitalize">{status}</Badge>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{count as number}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">No candidates in pipeline yet</p>
              <p className="mt-1 text-xs text-slate-400">Add candidates and start making calls to populate your pipeline</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
