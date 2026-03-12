import { useQuery } from '@tanstack/react-query'
import { getDashboard, getCallAnalytics } from '@/api/endpoints'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Phone, CheckCircle, XCircle, Clock } from 'lucide-react'

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Calls"
          value={calls.total ?? 0}
          icon={<Phone className="h-6 w-6" />}
        />
        <StatCard
          title="Connected"
          value={calls.connected ?? 0}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Failed"
          value={calls.failed ?? 0}
          icon={<XCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Avg Duration"
          value={`${calls.avg_duration ?? 0}s`}
          icon={<Clock className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Calls by Status (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(byStatus).map(([status, count]) => {
                const total = Object.values(byStatus).reduce(
                  (s: number, v) => s + (v as number),
                  0,
                )
                const pct = total > 0 ? Math.round(((count as number) / total) * 100) : 0
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{status}</span>
                      <span className="text-gray-500">
                        {count as number} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'completed'
                            ? 'bg-green-500'
                            : status === 'failed'
                              ? 'bg-red-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(byStatus).length === 0 && (
                <p className="text-gray-500 text-sm">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Call Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {daily.map(
                (d: { day: string; total: number; completed: number; failed: number }) => (
                  <div
                    key={d.day}
                    className="flex items-center justify-between py-2 border-b border-gray-50"
                  >
                    <span className="text-sm text-gray-600">{d.day}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-900 font-medium">{d.total} total</span>
                      <span className="text-green-600">{d.completed} ok</span>
                      <span className="text-red-600">{d.failed} fail</span>
                    </div>
                  </div>
                ),
              )}
              {daily.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
