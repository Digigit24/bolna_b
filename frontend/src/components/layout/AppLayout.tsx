import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-[260px] min-h-screen">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
