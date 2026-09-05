import React, { useState } from 'react';
import SidebarNav, { TopAlertStrip } from './components/Navbar';
import LandslideHeatmap from './components/Map/LandslideHeatmap';
import AlertManager from './components/Alerts/AlertManager';
import FieldReportPortal from './components/FieldReports/FieldReportPortal';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import MLRiskSimulator from './components/MLSandbox/MLRiskSimulator';
import PublicAlertPortal from './components/Public/PublicAlertPortal';
import ReliefFundPortal from './components/ReliefFund/ReliefFundPortal';
import NewsInfoHub from './components/News/NewsInfoHub';
import { LanguageProvider } from './context/LanguageContext';

const TABS = {
  map: LandslideHeatmap,
  alerts: AlertManager,
  'field-reports': FieldReportPortal,
  analytics: AnalyticsDashboard,
  'ml-sandbox': MLRiskSimulator,
  public: PublicAlertPortal,
  relief: ReliefFundPortal,
  news: NewsInfoHub
};

function MainCommandCenter() {
  const [activeTab, setActiveTab] = useState('map');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ActiveComponent = TABS[activeTab] || LandslideHeatmap;

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0a0f1a] text-[#e2e8f0] flex flex-col font-['DM_Sans',sans-serif] overflow-x-hidden">
      <TopAlertStrip />
      <div className="flex flex-1 pt-7 md:pt-7">
        <SidebarNav 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        <main 
          className={`flex-1 transition-all duration-300 w-full pt-12 md:pt-2 px-2 sm:px-4 md:px-6 pb-24 md:pb-6 ${
            isCollapsed ? 'md:ml-16' : 'md:ml-56'
          }`}
        >
          <ActiveComponent />
        </main>
      </div>
    </div>
  );
}

export default () => <LanguageProvider><MainCommandCenter /></LanguageProvider>;

