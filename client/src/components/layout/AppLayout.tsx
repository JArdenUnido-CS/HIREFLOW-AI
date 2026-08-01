import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GradientOrbs } from '@/components/shared/GradientOrbs';
import { NotificationPanel } from '@/components/shared/NotificationPanel';
import { CommandPalette } from '@/components/shared/CommandPalette';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950 transition-theme">
      <GradientOrbs />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <NotificationPanel />
      <CommandPalette />
    </div>
  );
}
