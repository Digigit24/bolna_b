import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50/50 text-gray-900 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
