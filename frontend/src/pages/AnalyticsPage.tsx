import { useQuery } from '@tanstack/react-query'
import { getDashboard, getCallAnalytics } from '@/api/endpoints'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Phone, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
  })

  const { data: callAnalytics } = useQuery({
    queryKey: ['call-analytics'],
    queryFn: () => getCallAnalytics(30).then((r) => r.data),
  })

  const calls = dashboard?.calls ?? {}
  const byStatus = callAnalytics?.by_status ?? {}
  const daily = callAnalytics?.daily ?? []

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Call performance metrics and trends
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Calls"
          value={calls.total ?? 0}
          icon={<Phone className="h-5 w-5" />}
        />
        <StatCard
          title="Connected"
          value={calls.connected ?? 0}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Failed"
          value={calls.failed ?? 0}
          icon={<XCircle className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Duration"
          value={`${calls.avg_duration ?? 0}s`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Call status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Calls by Status (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byStatus).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(byStatus).map(([status, count]) => {
                  const total = Object.values(byStatus).reduce(
                    (s: number, v) => s + (v as number),
                    0,
                  )
                  const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                  return (
                    <div key={status}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium capitalize text-slate-700">{status}</span>
                        <span className="tabular-nums text-slate-500">
                          {count as number}{' '}
                          <span className="text-slate-400">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            status === 'completed'
                              ? 'bg-emerald-500'
                              : status === 'failed'
                                ? 'bg-red-500'
                                : status === 'calling'
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Call Volume</CardTitle>
          </CardHeader>
          <CardContent>
            {daily.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {daily.map(
                  (d: { day: string; total: number; completed: number; failed: number }) => (
                    <div
                      key={d.day}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-slate-600">{d.day}</span>
                      <div className="flex items-center gap-4 text-sm tabular-nums">
                        <span className="font-medium text-slate-900">{d.total}</span>
                        <span className="flex items-center gap-1 text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {d.completed}
                        </span>
                        <span className="flex items-center gap-1 text-red-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {d.failed}
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">No data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
