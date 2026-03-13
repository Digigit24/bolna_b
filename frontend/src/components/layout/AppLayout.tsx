import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSidebarStore } from '@/store/sidebarStore'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const collapsed = useSidebarStore((s) => s.collapsed)

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          collapsed ? 'ml-[68px]' : 'ml-[252px]',
        )}
      >
        <div className="mx-auto max-w-[1360px] px-6 py-6 lg:px-8 lg:py-8">
          <div className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
