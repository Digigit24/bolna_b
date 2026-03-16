import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Compass, Headset, LogOut, User, Users2, Activity, 
  CalendarCheck2, BriefcaseBusiness, Building, ChevronLeft, ChevronRight,
  Settings, Bell, Search, HelpCircle, ShieldCheck, Globe, Briefcase
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { cn } from '../../lib/utils';

export default function Sidebar({ isMobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }) {
  const { logout, user } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Compass },
    { name: 'Organizations', href: '/organizations', icon: Globe },
    { name: 'Recruitment', href: '/jobs', icon: BriefcaseBusiness },
    { name: 'Comm Logs', href: '/calls', icon: Headset },
    { name: 'Talent Pool', href: '/candidates', icon: Users2 },
    { name: 'Schedules', href: '/interviews', icon: CalendarCheck2 },
    { name: 'Core Status', href: '/health', icon: ShieldCheck },
  ];

  const secondaryNav = [
    { name: 'Support', icon: HelpCircle },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 transition-all duration-300 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full",
        isCollapsed ? "lg:w-[84px]" : "lg:w-[260px]"
      )}
    >
      {/* Header / Logo Section */}
      <div className="flex h-20 items-center px-5 shrink-0 border-b border-slate-100 bg-linear-to-b from-white to-slate-50/20 relative">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
            <BriefcaseBusiness className="text-white h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="font-black text-indigo-600 tracking-tight text-xl uppercase whitespace-nowrap">Smart</span>
              <span className="font-bold text-slate-900 tracking-tight text-xl uppercase whitespace-nowrap">HR</span>
            </div>
          )}
        </div>
        
        {/* Desktop Collapse Toggle - Improved Visibility */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 shadow-md hover:shadow-indigo-100 transition-all z-20 cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-4 space-y-8 scrollbar-hide">
        
        {/* Main Menu Group */}
        <div>
          {!isCollapsed && (
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 animate-in fade-in duration-500">
              Main Menu
            </h3>
          )}
          <nav className="space-y-1.5 flex flex-col">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isActive
                      ? "bg-indigo-50/80 text-indigo-600 shadow-sm shadow-indigo-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  title={isCollapsed ? item.name : ""}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-600 rounded-full" />
                  )}
                  
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-300",
                      isActive ? "text-indigo-600" : "text-slate-400 group-hover:scale-110 group-hover:text-slate-600"
                    )}
                  />
                  
                  {!isCollapsed && (
                    <span className="flex-1 transition-opacity animate-in fade-in duration-500">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="lg:group-hover:flex hidden absolute left-14 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg whitespace-nowrap z-100 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Secondary Menu Group */}
        <div className="mt-auto">
          {!isCollapsed && (
            <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
              Resources
            </h3>
          )}
          <div className="space-y-1.5">
            {secondaryNav.map((item) => (
              <button
                key={item.name}
                className="group w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all duration-300 relative"
              >
                <item.icon className="h-5 w-5 shrink-0 text-slate-400 group-hover:scale-110 group-hover:text-slate-600 transition-all" />
                {!isCollapsed && <span className="animate-in fade-in duration-500">{item.name}</span>}
                
                {isCollapsed && (
                  <div className="lg:group-hover:flex hidden absolute left-14 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg whitespace-nowrap z-100 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    {item.name}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Profile Section */}
      <div className="p-4 border-t border-slate-100 bg-[#F8FAFC]/30">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300",
          isCollapsed ? "justify-center px-2" : ""
        )}>
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold shrink-0 border border-slate-200">
            {user?.email?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || <User size={18} />}
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-500">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.username || user?.email?.split('@')[0] || 'Member'}
              </p>
              <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest truncate">
                {user?.role || 'Administrator'}
              </p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className={cn(
            "mt-3 flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "Log Out" : ""}
        >
          <LogOut className="h-5 w-5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          {!isCollapsed && <span className="animate-in fade-in duration-500">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

