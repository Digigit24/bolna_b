import { Search, Bell, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/jobs': 'Jobs',
  '/calls': 'Calls',
  '/interviews': 'Interviews',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

export function Topbar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Left - Page title */}
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      {/* Right - Search, notifications, profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200" />

        {/* Profile */}
        <div className="group relative">
          <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-700">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
              </p>
              <p className="text-[11px] capitalize text-slate-400">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Dropdown */}
          <div className="invisible absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg opacity-0 transition-all group-hover:visible group-hover:opacity-100">
            <a href="/settings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
            <div className="my-1 border-t border-slate-100" />
            <button onClick={logout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
