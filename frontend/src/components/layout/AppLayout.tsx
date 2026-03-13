import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar - fixed w-60 = 240px */}
      <Sidebar />

      {/* Main area - offset by sidebar width */}
      <div className="ml-60 flex min-h-screen flex-col">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
