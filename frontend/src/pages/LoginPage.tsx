import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/endpoints'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Phone, ArrowRight } from 'lucide-react'

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
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-indigo-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">HR AI Caller</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            AI-Powered<br />Candidate Screening<br />at Scale
          </h2>
          <p className="mt-4 max-w-md text-lg text-indigo-200">
            Automate your hiring pipeline with intelligent voice calls.
          </p>
          <div className="mt-8 flex gap-8">
            <div><p className="text-3xl font-bold">10x</p><p className="text-sm text-indigo-300">Faster</p></div>
            <div><p className="text-3xl font-bold">95%</p><p className="text-sm text-indigo-300">Accuracy</p></div>
            <div><p className="text-3xl font-bold">24/7</p><p className="text-sm text-indigo-300">Available</p></div>
          </div>
        </div>

        <p className="text-sm text-indigo-300">Powered by Bolna AI</p>
      </div>

      {/* Right form */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">HR AI Caller</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>

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
        </div>
      </div>
    </div>
  )
}
