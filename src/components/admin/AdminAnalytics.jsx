import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Users, 
  Globe, 
  Activity, 
  Smartphone, 
  Calendar, 
  Monitor, 
  Clock, 
  Map, 
  Zap,
  RefreshCw 
} from 'lucide-react';
import { analytics } from '../../services/firebase/config';
import { logEvent } from 'firebase/analytics';
import { collection, query, getDocs, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: { daily: 0, weekly: 0, monthly: 0 },
    userEngagement: { avgSessionDuration: 0, sessionsPerUser: 0 },
    topPages: [],
    userAcquisition: { organic: 0, direct: 0, referral: 0, social: 0 },
    deviceCategory: { desktop: 0, mobile: 0, tablet: 0 },
    geographicData: []
  });
  const [userActivity, setUserActivity] = useState([]);
  const [platformActivity, setPlatformActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  // Mock data generation for demonstration
  const generateMockData = () => {
    // Active users
    const activeUsers = {
      daily: Math.floor(Math.random() * 300) + 100,
      weekly: Math.floor(Math.random() * 1000) + 500,
      monthly: Math.floor(Math.random() * 3000) + 1000
    };

    // User engagement
    const userEngagement = {
      avgSessionDuration: Math.floor(Math.random() * 300) + 60, // in seconds
      sessionsPerUser: (Math.random() * 5 + 1).toFixed(2)
    };

    // Top pages
    const pages = [
      '/platforms', 
      '/', 
      '/deposit', 
      '/profile', 
      '/wallets'
    ];
    
    const topPages = pages.map(page => ({
      path: page,
      views: Math.floor(Math.random() * 1000) + 100,
      avgTime: Math.floor(Math.random() * 300) + 30 // in seconds
    })).sort((a, b) => b.views - a.views);

    // User acquisition
    const userAcquisition = {
      organic: Math.floor(Math.random() * 500) + 100,
      direct: Math.floor(Math.random() * 700) + 300,
      referral: Math.floor(Math.random() * 300) + 50,
      social: Math.floor(Math.random() * 200) + 50
    };

    // Device category
    const deviceCategory = {
      desktop: Math.floor(Math.random() * 600) + 400,
      mobile: Math.floor(Math.random() * 800) + 600,
      tablet: Math.floor(Math.random() * 100) + 20
    };

    // Geographic data
    const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany'];
    const geographicData = countries.map(country => ({
      country,
      users: Math.floor(Math.random() * 500) + 50
    })).sort((a, b) => b.users - a.users);

    return {
      activeUsers,
      userEngagement,
      topPages,
      userAcquisition,
      deviceCategory,
      geographicData
    };
  };

  // Generate mock platform activity data
  const generateMockPlatformActivity = () => {
    const platforms = [
      { id: 'fanduel', name: 'FanDuel' },
      { id: 'draftkings', name: 'DraftKings' },
      { id: 'betmgm', name: 'BetMGM' },
      { id: 'caesars', name: 'Caesars' },
      { id: 'espnbet', name: 'ESPN Bet' },
      { id: 'fanatics', name: 'Fanatics' },
      { id: 'mcluck', name: 'McLuck' },
      { id: 'pulsz', name: 'Pulsz' }
    ];

    return platforms.map(platform => ({
      ...platform,
      visits: Math.floor(Math.random() * 1000) + 100,
      signups: Math.floor(Math.random() * 100) + 10,
      conversion: (Math.random() * 20 + 5).toFixed(2) + '%'
    })).sort((a, b) => b.visits - a.visits);
  };

  // Generate mock user activity data
  const generateMockUserActivity = () => {
    const activities = ['signup', 'login', 'deposit', 'platform_visit', 'gift_card_request'];
    const result = [];
    
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setMinutes(date.getMinutes() - i * 30); // Every 30 minutes
      
      result.push({
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        activity: activities[Math.floor(Math.random() * activities.length)],
        timestamp: date,
        details: 'User activity details here'
      });
    }
    
    return result;
  };

  // Fetch real user data from Firestore
  const fetchRealUserData = async () => {
    try {
      // Get user count
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;
      
      // Get recent users
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // This won't work without the right indexes set up, so we'll simulate it
      // Just as an example of the queries you'd write
      
      // In a real implementation, you'd need to define these queries differently
      // based on your Firestore structure and indexes
      
      // Get active users based on createdAt
      // This assumes you have a createdAt field in your user documents
      try {
        const dailyActiveQuery = query(
          usersRef,
          where('lastSeen', '>=', Timestamp.fromDate(oneDayAgo)),
          limit(1000)
        );
        const weeklyActiveQuery = query(
          usersRef,
          where('lastSeen', '>=', Timestamp.fromDate(oneWeekAgo)),
          limit(1000)
        );
        const monthlyActiveQuery = query(
          usersRef, 
          where('lastSeen', '>=', Timestamp.fromDate(oneMonthAgo)),
          limit(1000)
        );

        const [dailySnapshot, weeklySnapshot, monthlySnapshot] = await Promise.all([
          getDocs(dailyActiveQuery),
          getDocs(weeklyActiveQuery),
          getDocs(monthlyActiveQuery)
        ]);

        // Update analytics data with real data mixed with mock data
        setAnalyticsData(prev => ({
          ...generateMockData(),
          activeUsers: {
            daily: dailySnapshot.size,
            weekly: weeklySnapshot.size,
            monthly: monthlySnapshot.size
          }
        }));
      } catch (error) {
        console.error("Error fetching active users:", error);
        // Fall back to mock data
        setAnalyticsData(generateMockData());
      }
      
      // Get user activity
      try {
        // If you have an activity log collection:
        // const activityRef = collection(db, 'activityLog');
        // const recentActivityQuery = query(
        //   activityRef,
        //   orderBy('timestamp', 'desc'),
        //   limit(20)
        // );
        // const activitySnapshot = await getDocs(recentActivityQuery);
        // const activityData = activitySnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));
        // setUserActivity(activityData);
        
        // For now, use mock data
        setUserActivity(generateMockUserActivity());
      } catch (error) {
        console.error("Error fetching user activity:", error);
        setUserActivity(generateMockUserActivity());
      }
      
      // Get platform activity
      setPlatformActivity(generateMockPlatformActivity());
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      // Fall back to mock data
      setAnalyticsData(generateMockData());
      setUserActivity(generateMockUserActivity());
      setPlatformActivity(generateMockPlatformActivity());
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Log analytics view event
    if (analytics) {
      logEvent(analytics, 'admin_analytics_view');
    }
    
    fetchRealUserData();
    
    // Set up a refresh interval - refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchRealUserData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const refreshData = () => {
    setLoading(true);
    fetchRealUserData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Format large numbers with comma separators
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Format time in seconds to minutes and seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-md ${timeRange === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-md ${timeRange === '30d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 rounded-md ${timeRange === '90d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              90 Days
            </button>
          </div>
          <button 
            onClick={refreshData}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Users Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500 rounded-full text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Daily Active Users</h3>
          </div>
          <div className="text-3xl font-bold text-blue-700">{formatNumber(analyticsData.activeUsers.daily)}</div>
          <div className="mt-2 text-sm text-blue-600">Active users in the last 24 hours</div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-500 rounded-full text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Weekly Active Users</h3>
          </div>
          <div className="text-3xl font-bold text-green-700">{formatNumber(analyticsData.activeUsers.weekly)}</div>
          <div className="mt-2 text-sm text-green-600">Active users in the last 7 days</div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-500 rounded-full text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Monthly Active Users</h3>
          </div>
          <div className="text-3xl font-bold text-purple-700">{formatNumber(analyticsData.activeUsers.monthly)}</div>
          <div className="mt-2 text-sm text-purple-600">Active users in the last 30 days</div>
        </div>
      </div>

      {/* User Engagement Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gray-700 rounded-full text-white">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">User Engagement</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500">Avg. Session Duration</div>
              <div className="text-2xl font-bold text-gray-800">{formatTime(analyticsData.userEngagement.avgSessionDuration)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Sessions Per User</div>
              <div className="text-2xl font-bold text-gray-800">{analyticsData.userEngagement.sessionsPerUser}</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-500 rounded-full text-white">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">User Acquisition</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Direct</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(analyticsData.userAcquisition.direct)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Organic Search</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(analyticsData.userAcquisition.organic)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Referral</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(analyticsData.userAcquisition.referral)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Social</div>
              <div className="text-lg font-bold text-gray-800">{formatNumber(analyticsData.userAcquisition.social)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Activity Section */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-full text-white">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Platform Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-200">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">Visits</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">Signups</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-indigo-800 uppercase tracking-wider">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-indigo-100">
              {platformActivity.map((platform) => (
                <tr key={platform.id} className="hover:bg-indigo-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{platform.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(platform.visits)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(platform.signups)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{platform.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device & Location Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-500 rounded-full text-white">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Device Category</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Monitor className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Desktop</span>
              </div>
              <div className="text-sm font-medium">{formatNumber(analyticsData.deviceCategory.desktop)}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.round(analyticsData.deviceCategory.desktop / (analyticsData.deviceCategory.desktop + analyticsData.deviceCategory.mobile + analyticsData.deviceCategory.tablet) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Mobile</span>
              </div>
              <div className="text-sm font-medium">{formatNumber(analyticsData.deviceCategory.mobile)}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${Math.round(analyticsData.deviceCategory.mobile / (analyticsData.deviceCategory.desktop + analyticsData.deviceCategory.mobile + analyticsData.deviceCategory.tablet) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Tablet</span>
              </div>
              <div className="text-sm font-medium">{formatNumber(analyticsData.deviceCategory.tablet)}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${Math.round(analyticsData.deviceCategory.tablet / (analyticsData.deviceCategory.desktop + analyticsData.deviceCategory.mobile + analyticsData.deviceCategory.tablet) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-teal-50 p-6 rounded-lg border border-teal-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-teal-500 rounded-full text-white">
              <Map className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Geographic Distribution</h3>
          </div>
          <div className="space-y-3">
            {analyticsData.geographicData.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="text-sm text-gray-700">{item.country}</div>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium">{formatNumber(item.users)}</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-teal-600 h-2 rounded-full" 
                      style={{ width: `${Math.round(item.users / analyticsData.geographicData[0].users * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gray-700 rounded-full text-white">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Recent User Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userActivity.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${activity.activity === 'signup' ? 'bg-green-100 text-green-800' : 
                        activity.activity === 'login' ? 'bg-blue-100 text-blue-800' : 
                        activity.activity === 'deposit' ? 'bg-purple-100 text-purple-800' :
                        activity.activity === 'platform_visit' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {activity.activity.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.timestamp.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popular Pages Section */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-yellow-500 rounded-full text-white">
            <BarChart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">Popular Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-yellow-200">
            <thead className="bg-yellow-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">Page Path</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">Page Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-yellow-800 uppercase tracking-wider">Avg. Time on Page</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-yellow-100">
              {analyticsData.topPages.map((page, index) => (
                <tr key={index} className="hover:bg-yellow-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.path}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatNumber(page.views)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatTime(page.avgTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;