import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { User, Key, Webhook, ExternalLink, Shield, Globe } from 'lucide-react'

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-0.5 text-[13px] text-slate-500">Manage your account and system configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
              <User className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <p className="text-[11px] text-slate-400">Your account information</p>
            </div>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-5">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-sm">
                    {profile.first_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-slate-900">
                      {profile.first_name} {profile.last_name}
                    </p>
                    <p className="text-[13px] text-slate-500">@{profile.username}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="space-y-3">
                  <InfoRow label="Email" value={profile.email || 'Not set'} />
                  <InfoRow label="Role">
                    <Badge className="capitalize">{profile.role}</Badge>
                  </InfoRow>
                  <InfoRow label="Organization" value={profile.organization_name || 'None'} />
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <Key className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div>
              <CardTitle>API Configuration</CardTitle>
              <p className="text-[11px] text-slate-400">Integration endpoints and docs</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ConfigCard
                icon={<Globe className="h-4 w-4 text-indigo-500" />}
                label="Backend API"
                value="/api/"
                mono
              />
              <ConfigCard
                icon={<Shield className="h-4 w-4 text-emerald-500" />}
                label="Authentication"
                value="Token-based (DRF)"
              />
              <ConfigCard
                icon={<Webhook className="h-4 w-4 text-purple-500" />}
                label="Bolna Webhook"
                value="POST /api/webhooks/bolna/"
                mono
              />
              <ConfigCard
                icon={<ExternalLink className="h-4 w-4 text-amber-500" />}
                label="API Documentation"
                value="/api/docs/"
                mono
                hint="Swagger UI"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
      <span className="text-[13px] font-medium text-slate-500">{label}</span>
      {children || <span className="text-[13px] text-slate-900">{value}</span>}
    </div>
  )
}

function ConfigCard({ icon, label, value, mono, hint }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; hint?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`mt-0.5 text-[13px] text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</p>
        {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}
