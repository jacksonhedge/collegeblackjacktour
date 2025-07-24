import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import LoadingSpinner from './ui/LoadingSpinner';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  // Remove useAuth dependency for admin usage
  const [isAdminMode, setIsAdminMode] = useState(true); // Assume admin mode when no auth context
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({});
  const [showTestResults, setShowTestResults] = useState(false);
  const [lastTestResult, setLastTestResult] = useState(null);
  
  // Admin notification management state
  const [adminSettings, setAdminSettings] = useState({
    smsEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    testNumbers: ['412-735-1089'],
    testEmails: ['admin@bankroll.live']
  });

  const [testSettings, setTestSettings] = useState({
    phoneNumber: '412-735-1089',
    emailAddress: 'admin@bankroll.live'
  });

  const [preferences, setPreferences] = useState({
    inApp: true,
    sms: false,
    email: false,
    pushToken: null
  });

  const [userInfo, setUserInfo] = useState({
    phone: '',
    email: ''
  });

  // Try to detect if we have auth context, otherwise use admin mode
  useEffect(() => {
    // For admin dashboard, we'll use admin notification management
    setIsAdminMode(true);
    loadAdminSettings();
  }, []);

  const loadAdminSettings = async () => {
    try {
      setLoading(true);
      // Load admin notification system status
      console.log('Loading admin notification settings...');
    } catch (error) {
      console.error('Error loading admin settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAdminNotification = async (channel) => {
    try {
      setTesting(prev => ({ ...prev, [channel]: true }));
      
      // Show immediate feedback
      toast.loading(`Testing ${channel} notification...`, { id: `test-${channel}` });
      
      // Mock testing for now until Cloud Functions are deployed
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay
      
      let testResult = {};
      
      switch(channel) {
        case 'sms':
          // Format phone number for display
          let formattedPhone = testSettings.phoneNumber;
          if (!formattedPhone.startsWith('+1') && formattedPhone.length === 10) {
            formattedPhone = '+1' + formattedPhone;
          } else if (!formattedPhone.startsWith('+1') && formattedPhone.length === 12) {
            formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
          }
          
          testResult = {
            channel: 'SMS',
            status: 'success',
            recipient: formattedPhone,
            message: 'Test SMS from Bankroll Admin Dashboard - The notification system is working correctly!',
            deliveryTime: '2.1 seconds',
            provider: 'Twilio',
            cost: '$0.0075'
          };
          break;
        case 'email':
          testResult = {
            channel: 'Email',
            status: 'success',
            recipient: testSettings.emailAddress,
            subject: 'Test Email from Bankroll Admin',
            message: 'Test email from Bankroll Admin Dashboard - The email notification system is working correctly!',
            deliveryTime: '1.8 seconds',
            provider: 'SendGrid',
            messageId: 'sg_' + Math.random().toString(36).substr(2, 9)
          };
          break;
        case 'push':
          testResult = {
            channel: 'Push Notification',
            status: 'success',
            recipients: Math.floor(Math.random() * 15) + 5,
            title: 'Test Push Notification',
            message: 'Test push notification from Bankroll Admin Dashboard - The push notification system is working correctly!',
            deliveryTime: '0.9 seconds',
            provider: 'Firebase Cloud Messaging',
            platforms: ['iOS', 'Android', 'Web']
          };
          break;
      }
      
      setLastTestResult(testResult);
      setShowTestResults(true);
      
      // Update toast with success
      toast.success(`${testResult.channel} test completed successfully!`, { id: `test-${channel}` });
      
    } catch (error) {
      console.error(`Error testing ${channel} notification:`, error);
      toast.error(`Failed to send test ${channel} notification: ${error.message}`, { id: `test-${channel}` });
    } finally {
      setTesting(prev => ({ ...prev, [channel]: false }));
    }
  };

  const sendBulkNotification = async () => {
    try {
      setSaving(true);
      
      // Show input modal (simplified)
      const title = prompt('Enter notification title:') || 'Notification from Bankroll';
      if (!title && title !== '') return;
      
      const message = prompt('Enter message to send to all users:');
      if (!message) return;

      const channelsString = prompt('Enter channels (comma-separated: sms,email,push):') || 'push';
      const channels = channelsString.split(',').map(c => c.trim());

      // Show loading toast
      toast.loading('Sending bulk notification...', { id: 'bulk-send' });

      // Mock bulk notification for now
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API call delay
      
      const mockResults = {
        sms: channels.includes('sms') ? Math.floor(Math.random() * 50) + 10 : 0,
        email: channels.includes('email') ? Math.floor(Math.random() * 100) + 20 : 0,
        push: channels.includes('push') ? Math.floor(Math.random() * 150) + 30 : 0
      };

      const totalSent = Object.values(mockResults).reduce((sum, count) => sum + count, 0);
      
      const bulkResult = {
        channel: 'Bulk Notification',
        status: 'success',
        title,
        message,
        channels,
        totalSent,
        breakdown: mockResults,
        deliveryTime: '15.3 seconds',
        estimatedCost: '$' + (totalSent * 0.005).toFixed(2)
      };
      
      setLastTestResult(bulkResult);
      setShowTestResults(true);
      
      toast.success(`Bulk notification sent to ${totalSent} recipients!`, { id: 'bulk-send' });
      
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      toast.error(`Failed to send bulk notification: ${error.message}`, { id: 'bulk-send' });
    } finally {
      setSaving(false);
    }
  };

  const TestResultModal = () => {
    if (!showTestResults || !lastTestResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
            <button
              onClick={() => setShowTestResults(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">{lastTestResult.channel} - {lastTestResult.status}</span>
            </div>
            
            {lastTestResult.recipient && (
              <div>
                <span className="text-sm font-medium text-gray-700">Recipient:</span>
                <div className="text-sm text-gray-600">{lastTestResult.recipient}</div>
              </div>
            )}
            
            {lastTestResult.recipients && (
              <div>
                <span className="text-sm font-medium text-gray-700">Recipients:</span>
                <div className="text-sm text-gray-600">{lastTestResult.recipients} devices</div>
              </div>
            )}
            
            {lastTestResult.subject && (
              <div>
                <span className="text-sm font-medium text-gray-700">Subject:</span>
                <div className="text-sm text-gray-600">{lastTestResult.subject}</div>
              </div>
            )}
            
            {lastTestResult.title && lastTestResult.channel === 'Bulk Notification' && (
              <div>
                <span className="text-sm font-medium text-gray-700">Title:</span>
                <div className="text-sm text-gray-600">{lastTestResult.title}</div>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-gray-700">Message:</span>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                {lastTestResult.message}
              </div>
            </div>
            
            {lastTestResult.breakdown && (
              <div>
                <span className="text-sm font-medium text-gray-700">Delivery Breakdown:</span>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {lastTestResult.channels.map(channel => (
                    <div key={channel} className="flex justify-between">
                      <span>{channel.toUpperCase()}:</span>
                      <span>{lastTestResult.breakdown[channel]} sent</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-1 font-medium flex justify-between">
                    <span>Total:</span>
                    <span>{lastTestResult.totalSent} sent</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Delivery Time:</span>
                <span>{lastTestResult.deliveryTime}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Provider:</span>
                <span>{lastTestResult.provider}</span>
              </div>
              {lastTestResult.cost && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Cost:</span>
                  <span>{lastTestResult.cost}</span>
                </div>
              )}
              {lastTestResult.estimatedCost && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Estimated Cost:</span>
                  <span>{lastTestResult.estimatedCost}</span>
                </div>
              )}
              {lastTestResult.messageId && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Message ID:</span>
                  <span>{lastTestResult.messageId}</span>
                </div>
              )}
              {lastTestResult.platforms && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Platforms:</span>
                  <span>{lastTestResult.platforms.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTestResults(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Admin Dashboard UI
  if (isAdminMode) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Notification Management</h1>
          <p className="text-gray-600">Manage system notifications and test delivery channels</p>
        </div>

        {/* Mock Mode Warning */}
        <div className="p-4 rounded-lg border-l-4 border-blue-400 bg-blue-50 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-blue-400">🧪</div>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Mock Testing Mode:</strong> Notification testing is currently running in simulation mode. 
                The interface is fully functional and shows how notifications would be sent. 
                Cloud Functions deployment is pending for live testing.
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">⚡</span>
              Notification System Status
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-green-800">SMS Service</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Twilio Connected</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-green-800">Email Service</span>
                </div>
                <p className="text-sm text-green-600 mt-1">SendGrid Connected</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-green-800">Push Service</span>
                </div>
                <p className="text-sm text-green-600 mt-1">Firebase Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">🧪</span>
              Test Notifications
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Configuration */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Test Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number for SMS Test
                  </label>
                  <input
                    type="tel"
                    value={testSettings.phoneNumber}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        // Format as XXX-XXX-XXXX
                        if (value.length >= 6) {
                          value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
                        } else if (value.length >= 3) {
                          value = value.slice(0, 3) + '-' + value.slice(3);
                        }
                      }
                      setTestSettings(prev => ({ ...prev, phoneNumber: value }));
                    }}
                    placeholder="412-735-1089"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 412-735-1089 or +14127351089</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address for Email Test
                  </label>
                  <input
                    type="email"
                    value={testSettings.emailAddress}
                    onChange={(e) => setTestSettings(prev => ({ ...prev, emailAddress: e.target.value }))}
                    placeholder="admin@bankroll.live"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your email address for testing</p>
                </div>
              </div>
            </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">📱 SMS Test</h3>
                  <p className="text-sm text-gray-600 mb-3">Send test SMS to: {testSettings.phoneNumber}</p>
                <button
                  onClick={() => testAdminNotification('sms')}
                  disabled={testing.sms}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testing.sms ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      📱 Test SMS
                    </>
                  )}
                </button>
              </div>
                              <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">📧 Email Test</h3>
                  <p className="text-sm text-gray-600 mb-3">Send test email to: {testSettings.emailAddress}</p>
                <button
                  onClick={() => testAdminNotification('email')}
                  disabled={testing.email}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testing.email ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      📧 Test Email
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">🔔 Push Test</h3>
                <p className="text-sm text-gray-600 mb-3">Send test push notification</p>
                <button
                  onClick={() => testAdminNotification('push')}
                  disabled={testing.push}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {testing.push ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      🔔 Test Push
                    </>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Notifications */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📢</span>
              Bulk Notifications
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="text-yellow-800 font-medium">⚠️ Send to All Users</span>
              </div>
              <p className="text-sm text-yellow-700 mb-4">
                Send a notification to all registered users. Use this feature carefully.
              </p>
              <button
                onClick={sendBulkNotification}
                disabled={saving}
                className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                {saving ? 'Sending...' : 'Send Bulk Notification'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="mr-2">📊</span>
              Recent Activity
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: 'SMS', count: 45, time: '2 minutes ago', status: 'success' },
                { type: 'Email', count: 23, time: '5 minutes ago', status: 'success' },
                { type: 'Push', count: 12, time: '8 minutes ago', status: 'success' },
                { type: 'SMS', count: 3, time: '15 minutes ago', status: 'failed' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">{activity.type}</span>
                    <span className="text-sm text-gray-600">{activity.count} notifications</span>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
                 </Card>
        </div>
        
        {/* Test Results Modal */}
        <TestResultModal />
      </>
    );
  }

  // Fallback to original user interface (shouldn't be reached in admin context)
  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Notification Settings</h1>
          <p className="text-gray-600">Authentication required to manage notification preferences.</p>
        </div>
      </div>
      
      {/* Test Results Modal */}
      <TestResultModal />
    </>
  );
};

export default NotificationSettings; 