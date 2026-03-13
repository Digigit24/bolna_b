import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Phone,
  BarChart3,
  Settings,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSidebarStore } from '@/store/sidebarStore'

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/candidates', label: 'Candidates', icon: Users },
  { path: '/calls', label: 'Calls', icon: Phone },
  { path: '/interviews', label: 'Interviews', icon: Calendar },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { collapsed, toggle } = useSidebarStore()

  return (
    <aside
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
            <Bot className="h-[18px] w-[18px] text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-slate-800 leading-tight">HR AI Caller</span>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggle}
        className="absolute -right-[14px] top-[80px] flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-600 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-hide">
        {!collapsed && (
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </div>
        )}
        <div className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive =
              path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

            return (
              <Link
                key={path}
                to={path}
                className={`group flex items-center rounded-lg transition-all duration-200 ${
                  collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'
                } ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                }`}
                title={collapsed ? label : undefined}
              >
                <Icon
                  className={`shrink-0 transition-colors ${
                    collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]'
                  } ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`}
                />
                {!collapsed && <span className="text-[14px]">{label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-200 p-3">
        <Link
          to="/settings"
          className={`group flex items-center rounded-lg transition-all duration-200 mb-3 ${
            collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5 gap-3'
          } ${
            location.pathname === '/settings'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings
            className={`shrink-0 transition-colors ${
              collapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]'
            } ${location.pathname === '/settings' ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`}
          />
          {!collapsed && <span className="text-[14px]">Settings</span>}
        </Link>

        {/* User */}
        <div className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 ${collapsed ? 'justify-center mx-auto w-10 h-10 px-0 rounded-full' : ''}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[13px] font-bold text-indigo-700 border border-indigo-200">
            {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[13px] font-bold text-slate-700 leading-none">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username || 'Admin'}
                </p>
                <p className="truncate text-[11px] font-medium text-slate-500 mt-1">{user?.email || 'admin@example.com'}</p>
              </div>
              <button
                onClick={logout}
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
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

