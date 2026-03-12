import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/api/endpoints'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function SettingsPage() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                  <p className="text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Username</p>
                  <p className="text-gray-900">{profile.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Email</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Role</p>
                  <Badge variant="default">{profile.role}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Organization</p>
                  <p className="text-gray-900">{profile.organization_name || 'None'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </CardContent>
        </Card>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase">Backend API</p>
                <p className="text-gray-900 font-mono text-xs">/api/</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Auth Method</p>
                <p className="text-gray-900">Token Authentication</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Bolna Webhook</p>
                <p className="text-gray-900 font-mono text-xs">POST /api/webhooks/bolna/</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
