import React, { useState } from 'react';
import LeftSidebar from '../components/navigation/LeftSidebar';
import MechanicalStockTicker from '../components/ticker/MechanicalStockTicker';
import PortfolioDashboard from '../components/dashboard/PortfolioDashboard';
import { useTheme } from '../contexts/ThemeContext';

const DashboardPage = () => {
  const { isDark } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Sidebar */}
      <LeftSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Stock Ticker */}
        <MechanicalStockTicker />
        
        {/* Welcome Message */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back!
          </h1>
        </div>
        
        {/* Portfolio Dashboard */}
        <PortfolioDashboard />
      </div>
    </div>
  );
};

export default DashboardPage;