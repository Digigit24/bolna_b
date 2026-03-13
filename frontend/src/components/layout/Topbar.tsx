import { Search, Bell } from 'lucide-react'
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
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'
  const description = pageDescriptions[location.pathname] || ''

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200/70 bg-white px-6">
      {/* Left - Page title */}
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
        <p className="truncate text-xs text-slate-400">{description}</p>
      </div>

      {/* Right - Search, notifications */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-52 rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 transition-colors focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
            3
          </span>
        </button>
      </div>
    </header>
  )
}
