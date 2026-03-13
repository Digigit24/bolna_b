import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PhoneCall, LogOut, User, Users, Activity, CalendarDays, Briefcase, Building2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const { logout, user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Organizations', href: '/organizations', icon: Building2 },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Calls', href: '/calls', icon: PhoneCall },
    { name: 'Candidates', href: '/candidates', icon: Users },
    { name: 'Interviews', href: '/interviews', icon: CalendarDays },
    { name: 'System Health', href: '/health', icon: Activity },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300">
      <div className="flex h-16 items-center px-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-indigo-600 tracking-tight">Bolna<span className="text-gray-800">HR</span></h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="flex flex-col space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3 rounded-xl p-2 transition-all hover:bg-gray-50 mb-3">
          <div className="bg-indigo-100 h-9 w-9 rounded-full flex items-center justify-center text-indigo-700 font-bold">
            {user?.username?.charAt(0)?.toUpperCase() || <User size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          Log Out
        </button>
      </div>
    </div>
  );
}
