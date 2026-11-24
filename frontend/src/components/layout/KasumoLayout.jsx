import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { KasumoSidebar } from './KasumoSidebar';
import { KasumoHeader } from './KasumoHeader';
import { KasumoMobileNav } from './KasumoMobileNav';

export const KasumoLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#edf2f9] flex font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Dark Navy Sidebar Navigation */}
      <KasumoSidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[252px] transition-all duration-200">
        {/* Top Header Bar */}
        <KasumoHeader
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
        />

        {/* 16:9 Proportional Desktop Canvas */}
        <main className="flex-1 w-full max-w-[1520px] mx-auto px-5 lg:px-8 py-5 pb-20 lg:pb-8">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <KasumoMobileNav />
    </div>
  );
};

export default KasumoLayout;
