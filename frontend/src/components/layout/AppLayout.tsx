import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppLayout() {
  return (
    /* Main Container: Flex row */
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      
      {/* Left Section: Sidebar stays naturally in the flex flow */}
      <Sidebar />

      {/* Right Section: Flex-1 takes remaining width completely independently */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        {/* The actual page content area, which scrolls independently */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px] w-full animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


