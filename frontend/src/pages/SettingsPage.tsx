import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, Key, Webhook, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your account and system configuration
        </p>
      </div>

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
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                    {profile.first_name?.[0]?.toUpperCase() ||
                      profile.username?.[0]?.toUpperCase() ||
                      'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-sm text-slate-500">@{profile.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{profile.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Role
                    </p>
                    <div className="mt-1">
                      <Badge>{profile.role}</Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Organization
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {profile.organization_name || 'None'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Key className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Backend API
                  </p>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="mt-1 font-mono text-sm text-slate-700">/api/</p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Auth Method
                </p>
                <p className="mt-1 text-sm text-slate-700">Token Authentication</p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Bolna Webhook
                  </p>
                  <Webhook className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="mt-1 font-mono text-sm text-slate-700">
                  POST /api/webhooks/bolna/
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    API Documentation
                  </p>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="mt-1 font-mono text-sm text-slate-700">/api/docs/</p>
                <p className="mt-0.5 text-xs text-slate-500">Swagger UI &middot; Interactive API explorer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
