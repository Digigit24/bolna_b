import { Search, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Overview Dashboard',
  '/candidates': 'Candidate Pipeline',
  '/jobs': 'Job Openings',
  '/calls': 'Call History',
  '/interviews': 'Upcoming Interviews',
  '/analytics': 'Analytics & Reports',
  '/settings': 'Workspace Settings',
}

const pageDescriptions: Record<string, string> = {
  '/': 'Get a birds-eye view of your hiring and screening pipeline',
  '/candidates': 'Manage, filter, and screen potential candidates',
  '/jobs': 'Create and manage your active job postings',
  '/calls': 'Monitor AI screening calls and review transcripts',
  '/interviews': 'Track scheduled interviews and sync calendars',
  '/analytics': 'Performance insights and detailed reporting',
  '/settings': 'Account details and AI integration settings',
}

export function Topbar() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'
  const description = pageDescriptions[location.pathname] || ''

  return (
    <header className="sticky top-0 z-30 flex h-[68px] w-full items-center justify-between border-b border-[#E2E8F0] bg-white/80 px-6 backdrop-blur-md transition-all">
      {/* Left - Page title */}
      <div className="min-w-0">
        <h1 className="text-[18px] font-bold tracking-tight text-slate-800">{title}</h1>
        <p className="mt-0.5 truncate text-[13px] font-medium text-slate-500">{description}</p>
      </div>

      {/* Right - Search, notifications */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates, jobs..."
            className="h-[34px] w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 transition-all hover:bg-slate-100 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-[3px] focus:ring-indigo-500/10"
          />
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

        {/* Notifications */}
        <button className="relative flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/10">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            3
          </span>
        </button>
      </div>
    </header>
  )
}
