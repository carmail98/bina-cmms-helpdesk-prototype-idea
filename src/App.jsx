import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TourProvider } from './context/TourContext';
import Sidebar from './components/Sidebar';
import HelpdeskModule from './features/helpdesk/HelpdeskModule';
import { Toast } from './components/ui';
import TourOverlay from './components/TourOverlay';
import WelcomeBanner from './components/WelcomeBanner';

function Shell() {
  const { toast } = useApp();
  const [current] = useState('helpdesk');
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        current={current}
        onNavigate={() => {}}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main className="min-w-0 flex-1 px-4 pb-10 pt-3 sm:px-6 lg:px-8 lg:pt-4">
        <div className="mx-auto max-w-7xl">
          <HelpdeskModule onOpenMobile={() => setMobileOpen(true)} />
        </div>
      </main>

      <Toast toast={toast} />
      <WelcomeBanner />
      <TourOverlay />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <TourProvider>
        <Shell />
      </TourProvider>
    </AppProvider>
  );
}
