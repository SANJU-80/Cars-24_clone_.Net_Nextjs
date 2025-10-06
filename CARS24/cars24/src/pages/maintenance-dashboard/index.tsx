import React from 'react';
import MaintenanceDashboard from '@/components/MaintenanceDashboard';
import Header from '@/components/Header';
import Fotter from '@/components/Fotter';

const MaintenanceDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <MaintenanceDashboard />
      </main>
      <Fotter />
    </div>
  );
};

export default MaintenanceDashboardPage;
