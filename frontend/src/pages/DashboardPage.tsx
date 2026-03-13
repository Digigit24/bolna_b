import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
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
        <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />)}
        </div>
      </div>
    )
  }

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
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="border-0 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <CardContent className="py-6">
          <h2 className="text-lg font-semibold text-white">
            Welcome back, {user?.first_name || user?.username}
          </h2>
          <p className="mt-1 text-sm text-indigo-200">
            Here&apos;s what&apos;s happening with your hiring pipeline today.
          </p>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, bg, fg }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${fg}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { label: 'Avg Duration', value: `${calls.avg_duration ?? 0}s`, icon: Clock },
          { label: 'Avg AI Score', value: calls.avg_ai_score ?? 0, icon: TrendingUp },
          { label: 'Total Calls', value: calls.total ?? 0, icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-900">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(pipeline).length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Object.entries(pipeline).map(([status, count]) => (
                <div key={status} className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center">
                  <Badge variant={statusVariant(status)} className="capitalize">{status}</Badge>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{count as number}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No candidates in pipeline yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
