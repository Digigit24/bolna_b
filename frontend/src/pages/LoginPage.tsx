import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Phone, ArrowRight, Zap, Target, Clock } from 'lucide-react'

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
      setError('Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute right-20 bottom-32 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">HR AI Caller</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            AI-Powered<br />Candidate Screening<br />at Scale
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-indigo-200">
            Automate your hiring pipeline with intelligent voice calls. Screen thousands of candidates effortlessly.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <Zap className="h-5 w-5 text-indigo-200" />
              <p className="mt-2 text-2xl font-bold">10x</p>
              <p className="text-sm text-indigo-300">Faster Screening</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <Target className="h-5 w-5 text-indigo-200" />
              <p className="mt-2 text-2xl font-bold">95%</p>
              <p className="text-sm text-indigo-300">AI Accuracy</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4">
              <Clock className="h-5 w-5 text-indigo-200" />
              <p className="mt-2 text-2xl font-bold">24/7</p>
              <p className="text-sm text-indigo-300">Availability</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-sm text-indigo-300">Powered by Bolna AI</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">HR AI Caller</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" autoComplete="username" required className="h-11" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" autoComplete="current-password" required className="h-11" />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={loading}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            Secured by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  )
}
