import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Headphones } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login({ username, password })
      setAuth(data.user, data.token)
      navigate('/')
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HR AI Caller</span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            AI-Powered<br />
            Candidate Screening<br />
            at Scale
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-indigo-200">
            Automate your hiring pipeline with intelligent voice calls.
            Screen, evaluate, and qualify candidates effortlessly.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold">10x</p>
              <p className="text-sm text-indigo-300">Faster Screening</p>
            </div>
            <div>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-sm text-indigo-300">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-indigo-300">Availability</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-indigo-300">Powered by Bolna AI</p>
      </div>

      {/* Right panel - login form */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-6 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">HR AI Caller</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-sm text-slate-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            HR AI Caller &middot; Powered by Bolna
          </p>
        </div>
      </div>
    </div>
  )
}
