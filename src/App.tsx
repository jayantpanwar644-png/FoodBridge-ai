import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationDrawer } from './components/NotificationDrawer';
import { RescueMissionModal } from './components/RescueMissionModal';
import { CreateListingModal } from './components/CreateListingModal';

import { DashboardPage } from './pages/DashboardPage';
import { FoodListingsPage } from './pages/FoodListingsPage';
import { AIMatchingPage } from './pages/AIMatchingPage';
import { ProductScannerPage } from './pages/ProductScannerPage';
import { DeliveryMapPage } from './pages/DeliveryMapPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { FoodReviewsPage } from './pages/FoodReviewsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';

// Secondary detail pages
import { SurplusPredictionPage } from './pages/SurplusPredictionPage';
import { SafetyQuarantinePage } from './pages/SafetyQuarantinePage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activeTab, currentUser } = useApp();
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // If user explicitly signed out, show the Login & Role Selection Page
  if (currentUser && !currentUser.isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900 font-sans p-6 sm:p-10">
        <LoginPage />
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      // Login & Profile Setup
      case 'login':
      case 'onboarding':
      case 'profile':
        return <LoginPage />;

      // 7 Main Simplified Navigation Sections
      case 'dashboard':
        return (
          <DashboardPage
            onOpenCreateListing={() => setIsCreateListingModalOpen(true)}
            onOpenRescueMission={() => setIsRescueModalOpen(true)}
          />
        );
      case 'listings':
        return (
          <FoodListingsPage
            onOpenCreateListing={() => setIsCreateListingModalOpen(true)}
          />
        );
      case 'matching':
        return <AIMatchingPage />;
      case 'scanner':
        return <ProductScannerPage />;
      case 'map':
        return <DeliveryMapPage />;
      case 'deliveries':
      case 'logistics':
        return <LogisticsPage />;
      case 'reviews':
        return <FoodReviewsPage />;

      // Secondary tools & reports
      case 'impact':
      case 'analytics':
        return <AnalyticsPage />;
      case 'prediction':
        return <SurplusPredictionPage />;
      case 'safety':
        return <SafetyQuarantinePage />;
      case 'audit':
        return <AuditTrailPage />;
      case 'settings':
        return <SettingsPage />;

      default:
        return (
          <DashboardPage
            onOpenCreateListing={() => setIsCreateListingModalOpen(true)}
            onOpenRescueMission={() => setIsRescueModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 text-surface-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        onOpenRescueMission={() => setIsRescueModalOpen(true)}
        onOpenCreateListing={() => setIsCreateListingModalOpen(true)}
        onToggleNotificationDrawer={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-5 sm:p-7 lg:p-9 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <RescueMissionModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
      />
      <CreateListingModal
        isOpen={isCreateListingModalOpen}
        onClose={() => setIsCreateListingModalOpen(false)}
      />
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
