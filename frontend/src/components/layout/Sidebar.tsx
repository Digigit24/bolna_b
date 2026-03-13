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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'

const navSections = [
  {
    label: 'Main',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/candidates', label: 'Candidates', icon: Users },
      { path: '/jobs', label: 'Jobs', icon: Briefcase },
    ],
  },
  {
    label: 'Activity',
    items: [
      { path: '/calls', label: 'Calls', icon: Phone },
      { path: '/interviews', label: 'Interviews', icon: Calendar },
      { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [{ path: '/settings', label: 'Settings', icon: Settings }],
  },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { collapsed, toggle } = useSidebarStore()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-slate-900 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[252px]',
      )}
    >
      {/* Brand */}
      <div className={cn('flex items-center border-b border-white/[0.06] px-4 h-16', collapsed ? 'justify-center' : 'gap-3')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
          <Phone className="h-4.5 w-4.5 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">HR AI Caller</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.1em]">Bolna Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ path, label, icon: Icon }) => {
                const isActive =
                  path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(path)

                return (
                  <Link
                    key={path}
                    to={path}
                    title={collapsed ? label : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300',
                      )}
                    />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/[0.06] px-2.5 py-2">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* User */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
            {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-200">
                  {user?.first_name
                    ? `${user.first_name} ${user.last_name || ''}`.trim()
                    : user?.username}
                </p>
                <p className="text-[11px] capitalize text-slate-500">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-red-400"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
