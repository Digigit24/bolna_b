import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { getDashboard } from '@/api/endpoints'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge, statusVariant } from '@/components/ui/Badge'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard().then((r) => r.data),
    refetchInterval: 30000, // refresh every 30s
  })

  if (isLoading) {
    return <div className="text-gray-500">Loading dashboard...</div>
  }

  const calls = data?.calls ?? {}
  const candidates = data?.candidates ?? {}
  const jobs = data?.jobs ?? {}
  const pipeline = candidates.pipeline ?? {}

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Calls Today"
          value={calls.today ?? 0}
          icon={<Phone className="h-6 w-6" />}
        />
        <StatCard
          title="Connected"
          value={calls.connected ?? 0}
          icon={<CheckCircle className="h-6 w-6" />}
        />
        <StatCard
          title="Qualified Candidates"
          value={candidates.qualified ?? 0}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Active Jobs"
          value={jobs.active ?? 0}
          icon={<Briefcase className="h-6 w-6" />}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Avg Call Duration"
          value={`${calls.avg_duration ?? 0}s`}
          icon={<Clock className="h-6 w-6" />}
        />
        <StatCard
          title="Avg AI Score"
          value={calls.avg_ai_score ?? 0}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Total Calls"
          value={calls.total ?? 0}
          icon={<Phone className="h-6 w-6" />}
        />
      </div>

      {/* Candidate pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {Object.entries(pipeline).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge variant={statusVariant(status)}>{status}</Badge>
                <span className="text-lg font-semibold text-gray-900">{count as number}</span>
              </div>
            ))}
            {Object.keys(pipeline).length === 0 && (
              <p className="text-gray-500 text-sm">No candidates yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
