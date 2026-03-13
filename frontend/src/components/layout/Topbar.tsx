import { Search, Bell, ChevronDown, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLocation, Link } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/jobs': 'Jobs',
  '/calls': 'Calls',
  '/interviews': 'Interviews',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

const pageDescriptions: Record<string, string> = {
  '/': 'Overview of your hiring pipeline',
  '/candidates': 'Manage and screen candidates',
  '/jobs': 'View and create job postings',
  '/calls': 'Monitor AI screening calls',
  '/interviews': 'Track scheduled interviews',
  '/analytics': 'Call performance insights',
  '/settings': 'Account and API settings',
}

export function Topbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'
  const description = pageDescriptions[location.pathname] || ''

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
      {/* Left - Page title */}
      <div>
        <h1 className="text-base font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      {/* Right - Search, notifications, profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50/80 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* Profile */}
        <div className="group relative">
          <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-700">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
              </p>
              <p className="text-[11px] capitalize text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* Dropdown */}
          <div className="invisible absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
              </p>
              <p className="text-xs text-slate-400">{user?.email || 'No email set'}</p>
            </div>
            <Link to="/settings" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50">
              <Settings className="h-4 w-4 text-slate-400" /> Settings
            </Link>
            <div className="my-1 border-t border-slate-100" />
            <button onClick={logout} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
