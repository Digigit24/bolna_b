import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, BriefcaseBusiness } from 'lucide-react';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        isMobileOpen={isSidebarOpen} 
        setMobileOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="lg:hidden flex h-16 items-center px-4 bg-white border-b border-slate-200 shrink-0 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="ml-4 flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BriefcaseBusiness size={18} className="text-white" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-black text-indigo-600 tracking-tight text-lg uppercase">Smart</span>
              <span className="font-bold text-slate-800 tracking-tight text-lg uppercase">HR</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

