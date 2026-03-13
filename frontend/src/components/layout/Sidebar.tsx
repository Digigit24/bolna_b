import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Phone,
  BarChart3,
  Settings,
  LogOut,
  Calendar,
  Headphones,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/calls', label: 'Calls', icon: Phone },
  { path: '/interviews', label: 'Interviews', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-slate-200/80 bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
          <Headphones className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-tight text-slate-900">HR AI Caller</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
            Powered by Bolna
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive =
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-indigo-600' : '')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
            {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ''}`.trim()
                : user?.username}
            </p>
            <p className="text-xs capitalize text-slate-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
