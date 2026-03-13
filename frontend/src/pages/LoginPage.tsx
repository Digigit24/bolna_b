import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Phone, ArrowRight, Shield, Zap, Globe } from 'lucide-react'

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
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding Panel */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between bg-slate-900 p-12 relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">HR AI Caller</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Enterprise Platform</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-[42px] font-bold leading-[1.1] tracking-tight text-white">
              Intelligent<br />
              Candidate Screening<br />
              <span className="text-indigo-400">Automated.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">
              Streamline your recruitment pipeline with AI-powered voice screening.
              Evaluate hundreds of candidates simultaneously with consistent, unbiased assessments.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <Zap className="mb-3 h-5 w-5 text-indigo-400" />
              <p className="text-2xl font-bold text-white">10x</p>
              <p className="mt-0.5 text-xs text-slate-500">Faster Screening</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <Shield className="mb-3 h-5 w-5 text-emerald-400" />
              <p className="text-2xl font-bold text-white">95%</p>
              <p className="mt-0.5 text-xs text-slate-500">Accuracy Rate</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <Globe className="mb-3 h-5 w-5 text-purple-400" />
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="mt-0.5 text-xs text-slate-500">Always Active</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-600">Powered by Bolna AI &middot; Enterprise Grade Security</p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-[45%]">
        <div className="w-full max-w-[380px]">
          {/* Mobile brand */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">HR AI Caller</span>
          </div>

          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-700">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-slate-700">
                  Password
                </label>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="h-11 w-full text-sm" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-10 border-t border-slate-100 pt-6">
            <p className="text-center text-xs text-slate-400">
              Secured by enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
