import React, { useState } from 'react';
import { KasumoSidebar } from './KasumoSidebar';
import { KasumoHeader } from './KasumoHeader';
import { KasumoMobileNav } from './KasumoMobileNav';

export const KasumoLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
      {/* Role-Aware Left Sidebar Navigation (Desktop) */}
      <KasumoSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'md:pl-18' : 'md:pl-64'
        }`}
      >
        {/* Contextual Top Header */}
        <KasumoHeader
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Dynamic Page Content (with pb-16 for mobile bottom nav padding) */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <KasumoMobileNav />
    </div>
  );
};
