import { useQuery } from '@tanstack/react-query'
import { getDashboard, getCallAnalytics } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Phone, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const { data: dashboard } = useQuery({ queryKey: ['dashboard'], queryFn: () => getDashboard().then((r) => r.data) })
  const { data: callAnalytics } = useQuery({ queryKey: ['call-analytics'], queryFn: () => getCallAnalytics(30).then((r) => r.data) })

  const calls = dashboard?.calls ?? {}
  const byStatus = callAnalytics?.by_status ?? {}
  const daily = callAnalytics?.daily ?? []

  const stats = [
    { label: 'Total Calls', value: calls.total ?? 0, icon: Phone, bg: 'bg-indigo-50', fg: 'text-indigo-600' },
    { label: 'Connected', value: calls.connected ?? 0, icon: CheckCircle, bg: 'bg-emerald-50', fg: 'text-emerald-600' },
    { label: 'Failed', value: calls.failed ?? 0, icon: XCircle, bg: 'bg-red-50', fg: 'text-red-600' },
    { label: 'Avg Duration', value: `${calls.avg_duration ?? 0}s`, icon: Clock, bg: 'bg-amber-50', fg: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
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
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium capitalize text-slate-700">{status}</span>
                        <span className="text-slate-500">{count as number} ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-10 text-center"><BarChart3 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm text-slate-400">No data</p></div>
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
                      <span className="font-semibold text-slate-900">{d.total}</span>
                      <span className="flex items-center gap-1 text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{d.completed}</span>
                      <span className="flex items-center gap-1 text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{d.failed}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center"><BarChart3 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-sm text-slate-400">No data</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
