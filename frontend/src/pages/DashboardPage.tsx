import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp, Activity, ArrowUpRight } from 'lucide-react'
import { getDashboard } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    refetchInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  const calls = data?.calls ?? {}
  const candidates = data?.candidates ?? {}
  const jobs = data?.jobs ?? {}
  const pipeline = candidates.pipeline ?? {}

  const stats = [
    { label: 'Calls Today', value: calls.today ?? 0, icon: Phone, color: 'bg-indigo-500', lightBg: 'bg-indigo-50', lightText: 'text-indigo-600' },
    { label: 'Connected', value: calls.connected ?? 0, icon: CheckCircle, color: 'bg-emerald-500', lightBg: 'bg-emerald-50', lightText: 'text-emerald-600' },
    { label: 'Qualified', value: candidates.qualified ?? 0, icon: Users, color: 'bg-purple-500', lightBg: 'bg-purple-50', lightText: 'text-purple-600' },
    { label: 'Active Jobs', value: jobs.active ?? 0, icon: Briefcase, color: 'bg-amber-500', lightBg: 'bg-amber-50', lightText: 'text-amber-600' },
  ]

  const secondaryStats = [
    { label: 'Avg Duration', value: `${calls.avg_duration ?? 0}s`, icon: Clock },
    { label: 'Avg AI Score', value: calls.avg_ai_score ?? 0, icon: TrendingUp },
    { label: 'Total Calls', value: calls.total ?? 0, icon: Activity },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-8 py-7">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-xl font-bold text-white">
            Welcome back, {user?.first_name || user?.username}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here's what's happening with your recruitment pipeline today.
          </p>
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, lightBg, lightText }) => (
          <div
            key={label}
            className="group relative overflow-hidden rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-[28px] font-bold tracking-tight text-slate-900">{value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${lightBg}`}>
                <Icon className={`h-5 w-5 ${lightText}`} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {secondaryStats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-5 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50">
              <Icon className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Candidate pipeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Candidate Pipeline</CardTitle>
          <a href="/candidates" className="flex items-center gap-1 text-[13px] font-medium text-indigo-600 hover:text-indigo-700">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </CardHeader>
        <CardContent>
          {Object.keys(pipeline).length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(pipeline).map(([status, count]) => (
                <div
                  key={status}
                  className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-5 transition-colors hover:bg-slate-50"
                >
                  <Badge variant={statusVariant(status)} className="mb-3 capitalize">
                    {status}
                  </Badge>
                  <span className="text-2xl font-bold tabular-nums text-slate-900">{count as number}</span>
                  <span className="mt-0.5 text-[11px] text-slate-400">candidates</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">No candidates yet</p>
              <p className="mt-1 text-xs text-slate-400">Add candidates to see your pipeline</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
