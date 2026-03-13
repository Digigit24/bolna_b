import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="ml-60 flex min-h-screen flex-col">
        <Topbar />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
