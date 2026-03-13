import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, Key, Globe, Shield, Webhook, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
              <User className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                    {profile.first_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{profile.first_name} {profile.last_name}</p>
                    <p className="text-xs text-slate-500">@{profile.username}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-500">Email</span>
                    <span className="text-sm text-slate-900">{profile.email || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-500">Role</span>
                    <Badge className="capitalize">{profile.role}</Badge>
                  </div>
                  <div className="flex justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <span className="text-sm text-slate-500">Organization</span>
                    <span className="text-sm text-slate-900">{profile.organization_name || 'None'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 animate-pulse rounded bg-slate-100" />)}</div>
            )}
          </CardContent>
        </Card>

        {/* API */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Key className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: <Globe className="h-4 w-4 text-indigo-500" />, label: 'Backend API', value: '/api/', mono: true },
                { icon: <Shield className="h-4 w-4 text-emerald-500" />, label: 'Auth Method', value: 'Token Authentication' },
                { icon: <Webhook className="h-4 w-4 text-purple-500" />, label: 'Bolna Webhook', value: 'POST /api/webhooks/bolna/', mono: true },
                { icon: <ExternalLink className="h-4 w-4 text-amber-500" />, label: 'API Docs', value: '/api/docs/', mono: true, hint: 'Swagger UI' },
              ].map(({ icon, label, value, mono, hint }) => (
                <div key={label} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <div className="mt-0.5">{icon}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className={`mt-0.5 text-sm text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</p>
                    {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
