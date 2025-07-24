import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import AdminLayout from '../components/admin/AdminLayout';
import {
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  Zap,
  Globe,
  Server,
  Database,
  CreditCard,
  TrendingUp,
  Users,
  Shield,
  Cpu,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';

const AdminAPIStatus = () => {
  const { isDark } = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [selectedService, setSelectedService] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Define all services to monitor
  const serviceDefinitions = [
    {
      id: 'dwolla',
      name: 'Dwolla',
      category: 'payment',
      icon: CreditCard,
      color: 'orange',
      description: 'ACH payment processing',
      endpoint: 'https://api.dwolla.com',
      checkEndpoint: '/status', // You'll need to implement actual endpoints
      documentation: 'https://developers.dwolla.com',
      critical: true
    },
    {
      id: 'meld',
      name: 'Meld',
      category: 'banking',
      icon: Database,
      color: 'blue',
      description: 'Bank account connections',
      endpoint: 'https://api.meld.io',
      checkEndpoint: '/health',
      documentation: 'https://docs.meld.io',
      critical: true
    },
    {
      id: 'sportsdata',
      name: 'Sports Data API',
      category: 'data',
      icon: TrendingUp,
      color: 'green',
      description: 'Real-time sports statistics',
      endpoint: 'https://api.sportsdata.io',
      checkEndpoint: '/v3/status',
      documentation: 'https://sportsdata.io/developers',
      critical: true
    },
    {
      id: 'kalshi',
      name: 'Kalshi',
      category: 'trading',
      icon: TrendingUp,
      color: 'purple',
      description: 'Event trading platform',
      endpoint: 'https://api.kalshi.com',
      checkEndpoint: '/health',
      documentation: 'https://kalshi.com/docs',
      critical: false
    },
    {
      id: 'supabase',
      name: 'Supabase',
      category: 'database',
      icon: Database,
      color: 'green',
      description: 'Database and authentication',
      endpoint: 'https://cferwghhtstkxdiqhfqj.supabase.co',
      checkEndpoint: '/rest/v1/',
      documentation: 'https://supabase.com/docs',
      critical: true
    },
    {
      id: 'firebase',
      name: 'Firebase',
      category: 'backend',
      icon: Server,
      color: 'yellow',
      description: 'Notifications and analytics',
      endpoint: 'https://fcm.googleapis.com',
      checkEndpoint: '/fcm/send',
      documentation: 'https://firebase.google.com/docs',
      critical: true
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'communication',
      icon: Globe,
      color: 'blue',
      description: 'Email delivery service',
      endpoint: 'https://api.sendgrid.com',
      checkEndpoint: '/v3/mail/send',
      documentation: 'https://sendgrid.com/docs',
      critical: false
    },
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'communication',
      icon: Users,
      color: 'red',
      description: 'SMS notifications',
      endpoint: 'https://api.twilio.com',
      checkEndpoint: '/2010-04-01/Accounts',
      documentation: 'https://www.twilio.com/docs',
      critical: false
    },
    {
      id: 'plaid',
      name: 'Plaid',
      category: 'banking',
      icon: Shield,
      color: 'black',
      description: 'Bank data aggregation',
      endpoint: 'https://production.plaid.com',
      checkEndpoint: '/institutions/get',
      documentation: 'https://plaid.com/docs',
      critical: false
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      icon: CreditCard,
      color: 'purple',
      description: 'Payment processing',
      endpoint: 'https://api.stripe.com',
      checkEndpoint: '/v1/charges',
      documentation: 'https://stripe.com/docs',
      critical: true
    }
  ];

  // Check service status
  const checkServiceStatus = async (service) => {
    try {
      // In production, this would call your backend API which would then check the service
      // For now, we'll simulate the check
      const startTime = Date.now();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
      
      const responseTime = Date.now() - startTime;
      const isHealthy = Math.random() > 0.1; // 90% uptime simulation
      
      return {
        ...service,
        status: isHealthy ? 'operational' : Math.random() > 0.5 ? 'degraded' : 'down',
        responseTime,
        lastChecked: new Date(),
        uptime: isHealthy ? 99.9 : 95.5,
        details: {
          latency: responseTime,
          lastError: !isHealthy ? 'Connection timeout' : null,
          lastSuccess: new Date(),
          consecutiveFailures: !isHealthy ? Math.floor(Math.random() * 5) : 0
        }
      };
    } catch (error) {
      return {
        ...service,
        status: 'error',
        responseTime: null,
        lastChecked: new Date(),
        uptime: 0,
        details: {
          error: error.message,
          consecutiveFailures: 1
        }
      };
    }
  };

  // Check all services
  const checkAllServices = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        serviceDefinitions.map(service => checkServiceStatus(service))
      );
      setServices(results);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAllServices();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        checkAllServices();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'degraded':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'down':
      case 'error':
        return isDark ? 'text-red-400' : 'text-red-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return CheckCircle;
      case 'degraded':
        return AlertCircle;
      case 'down':
      case 'error':
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  // Get category stats
  const getCategoryStats = () => {
    const stats = {};
    services.forEach(service => {
      if (!stats[service.category]) {
        stats[service.category] = { total: 0, operational: 0 };
      }
      stats[service.category].total++;
      if (service.status === 'operational') {
        stats[service.category].operational++;
      }
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  // Get overall health
  const getOverallHealth = () => {
    const operational = services.filter(s => s.status === 'operational').length;
    const total = services.length;
    const percentage = total > 0 ? (operational / total) * 100 : 0;
    
    if (percentage === 100) return { status: 'All Systems Operational', color: 'green' };
    if (percentage >= 90) return { status: 'Minor Issues', color: 'yellow' };
    if (percentage >= 50) return { status: 'Major Issues', color: 'orange' };
    return { status: 'Critical Issues', color: 'red' };
  };

  const overallHealth = getOverallHealth();

  return (
    <AdminLayout activeTab="api-status">
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Status Monitor
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time monitoring of external service dependencies
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Auto-refresh
                </label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh 
                      ? 'bg-purple-600' 
                      : isDark ? 'bg-gray-700' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <button
                onClick={checkAllServices}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Checking...' : 'Check Now'}
              </button>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${overallHealth.color}-100 dark:bg-${overallHealth.color}-900/30`}>
                  <Activity className={`w-8 h-8 text-${overallHealth.color}-600 dark:text-${overallHealth.color}-400`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {overallHealth.status}
                  </h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {services.filter(s => s.status === 'operational').length} of {services.length} services operational
                  </p>
                </div>
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Last checked: {format(lastChecked, 'HH:mm:ss')}
              </div>
            </div>
          </div>

          {/* Category Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div
                key={category}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              >
                <p className={`text-sm font-medium mb-1 capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {category}
                </p>
                <p className={`text-2xl font-bold ${
                  stats.operational === stats.total 
                    ? isDark ? 'text-green-400' : 'text-green-600'
                    : isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`}>
                  {stats.operational}/{stats.total}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  services operational
                </p>
              </div>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const StatusIcon = getStatusIcon(service.status);
              const ServiceIcon = service.icon;
              
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                  } shadow-sm hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/30`}>
                        <ServiceIcon className={`w-5 h-5 text-${service.color}-600 dark:text-${service.color}-400`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {service.name}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {service.description}
                        </p>
                      </div>
                    </div>
                    {service.critical && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                      }`}>
                        Critical
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(service.status)}`} />
                      <span className={`text-sm font-medium capitalize ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                    
                    {service.responseTime && (
                      <div className="flex items-center gap-1">
                        <Zap className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {service.responseTime}ms
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {service.uptime !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
                          Uptime
                        </span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                          {service.uptime}%
                        </span>
                      </div>
                      <div className={`h-2 rounded-full overflow-hidden ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-full transition-all ${
                            service.uptime >= 99 ? 'bg-green-500' :
                            service.uptime >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${service.uptime}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Service Detail Modal */}
          {selectedService && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className={`max-w-2xl w-full rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-xl`}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-${selectedService.color}-100 dark:bg-${selectedService.color}-900/30`}>
                        <selectedService.icon className={`w-6 h-6 text-${selectedService.color}-600 dark:text-${selectedService.color}-400`} />
                      </div>
                      <div>
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {selectedService.name}
                        </h2>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {selectedService.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedService(null)}
                      className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Status
                          </p>
                          <p className={`font-semibold capitalize ${getStatusColor(selectedService.status)}`}>
                            {selectedService.status}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Response Time
                          </p>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedService.responseTime || 'N/A'}ms
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Uptime
                          </p>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedService.uptime || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Last Checked
                          </p>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {format(selectedService.lastChecked, 'HH:mm:ss')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Connection Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Endpoint
                          </span>
                          <span className={`font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {selectedService.endpoint}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Category
                          </span>
                          <span className={`capitalize ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {selectedService.category}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Priority
                          </span>
                          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {selectedService.critical ? 'Critical' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedService.details && selectedService.details.lastError && (
                      <div className={`p-4 rounded-lg border ${
                        isDark 
                          ? 'bg-red-900/20 border-red-800' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <h3 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                            Last Error
                          </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                          {selectedService.details.lastError}
                        </p>
                        {selectedService.details.consecutiveFailures > 0 && (
                          <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                            {selectedService.details.consecutiveFailures} consecutive failures
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <a
                        href={selectedService.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Info className="w-4 h-4" />
                        Documentation
                      </a>
                      <button
                        onClick={() => {
                          checkServiceStatus(selectedService).then(updated => {
                            setServices(services.map(s => 
                              s.id === updated.id ? updated : s
                            ));
                            setSelectedService(updated);
                          });
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isDark 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Test Connection
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAPIStatus;