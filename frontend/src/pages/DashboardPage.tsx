import { useQuery } from '@tanstack/react-query'
import { Phone, Users, Briefcase, CheckCircle, Clock, TrendingUp, Activity, ArrowUpRight, BarChart2 } from 'lucide-react'
import { getDashboard } from '@/api/endpoints'
import { Badge, statusVariant } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'

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
    { label: 'Active Jobs', value: jobs.active ?? 0, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Total Candidates', value: candidates.total ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Calls Today', value: calls.today ?? 0, icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Qualified', value: candidates.qualified ?? 0, icon: CheckCircle, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Welcome back, {user?.first_name || user?.username || 'Admin'}
          </h2>
          <p className="text-[14px] text-slate-500 mt-1">
            Here's what's happening with your hiring pipeline today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/candidates"
            className="inline-flex h-[38px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Add Candidates
          </Link>
          <Link
            to="/calls"
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Phone className="h-[14px] w-[14px]" /> Start Campaign
          </Link>
        </div>
      </div>

      {isError && (
        <ErrorState
          compact
          title="Could not fetch latest updates. Showing cached or default values."
          onRetry={() => refetch()}
        />
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="skeleton mb-4 h-4 w-20" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-slate-500">{label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${border} ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline Distribution */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-[15px] font-semibold text-slate-800">Candidate Pipeline Status</h3>
            <Link to="/analytics" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View Report <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex-1 p-5 bg-slate-50/30">
            {Object.keys(pipeline).length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 h-full">
                {Object.entries(pipeline).map(([status, count]) => (
                  <div key={status} className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-4 shadow-sm">
                    <p className="text-2xl font-bold text-slate-800">{count as number}</p>
                    <Badge variant={statusVariant(status)} className="mt-2 capitalize align-middle text-[11px] font-medium">
                      {status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                  <BarChart2 className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="mt-3 text-[14px] font-semibold text-slate-800">No active pipeline</h4>
                <p className="mt-1 text-[13px] text-slate-500">Add candidates to track their progress.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Performance */}
        <div className="col-span-1 rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-[15px] font-semibold text-slate-800">AI Screening Performance</h3>
          </div>
          <div className="flex-1 p-5 flex flex-col justify-center space-y-5">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Average Duration</p>
                  <p className="text-lg font-bold text-slate-800">{calls.avg_duration ? `${calls.avg_duration}s` : '0s'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Average AI Score</p>
                  <p className="text-lg font-bold text-slate-800">{calls.avg_ai_score ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 border border-violet-100">
                  <Activity className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-slate-500">Total Managed Calls</p>
                  <p className="text-lg font-bold text-slate-800">{calls.total ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
