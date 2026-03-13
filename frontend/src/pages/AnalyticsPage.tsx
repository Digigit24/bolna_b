import { useQuery } from '@tanstack/react-query'
import { getDashboard, getCallAnalytics } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Phone, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: dashboard, isError: dashError, refetch: refetchDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    retry: 2,
  })
  const { data: callAnalytics, isError: callsError, refetch: refetchCalls } = useQuery({
    queryKey: ['call-analytics'],
    queryFn: () => getCallAnalytics(30).then((r) => r.data),
    retry: 2,
  })

  const calls = dashboard?.calls ?? {}
  const byStatus = callAnalytics?.by_status ?? {}
  const daily = callAnalytics?.daily ?? []

  const hasError = dashError || callsError

  const stats = [
    { label: 'Total Calls', value: calls.total ?? 0, icon: Phone, bg: 'bg-indigo-50', fg: 'text-indigo-600' },
    { label: 'Connected', value: calls.connected ?? 0, icon: CheckCircle, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    { label: 'Failed', value: calls.failed ?? 0, icon: XCircle, bg: 'bg-red-50', fg: 'text-red-600' },
    { label: 'Avg Duration', value: `${calls.avg_duration ?? 0}s`, icon: Clock, bg: 'bg-amber-50', fg: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6 fade-in">
      {hasError && (
        <ErrorState
          compact
          title="Some analytics data could not be loaded"
          onRetry={() => { refetchDash(); refetchCalls() }}
        />
      )}

      {/* Stats */}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* By status */}
        <Card>
          <CardHeader><CardTitle>Calls by Status (30 days)</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(byStatus).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(byStatus).map(([status, count]) => {
                  const total = Object.values(byStatus).reduce((s: number, v) => s + (v as number), 0)
                  const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                  const color = status === 'completed' ? 'bg-emerald-500' : status === 'failed' ? 'bg-red-500' : 'bg-indigo-500'
                  return (
                    <div key={status}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="font-medium capitalize text-slate-700">{status}</span>
                        <span className="tabular-nums text-slate-500">{count as number} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-sm text-slate-500">No call data available yet</p>
                <p className="mt-1 text-xs text-slate-400">Start making calls to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily */}
        <Card>
          <CardHeader><CardTitle>Daily Volume</CardTitle></CardHeader>
          <CardContent>
            {daily.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {daily.map((d: { day: string; total: number; completed: number; failed: number }) => (
                  <div key={d.day} className="flex items-center justify-between py-3">
                    <span className="text-sm text-slate-600">{d.day}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-semibold tabular-nums text-slate-900">{d.total}</span>
                      <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{d.completed}</span>
                      <span className="flex items-center gap-1.5 text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{d.failed}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <p className="mt-3 text-sm text-slate-500">No daily data available</p>
                <p className="mt-1 text-xs text-slate-400">Data will appear after your first calls</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
