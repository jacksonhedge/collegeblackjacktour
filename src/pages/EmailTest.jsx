import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/SupabaseAuthContext';
import EmailService from '../services/EmailService';
import { Mail, Send, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const EmailTest = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [recipientEmail, setRecipientEmail] = useState(currentUser?.email || '');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const templates = {
    welcome: {
      name: 'Welcome Email',
      description: 'Sent when a new user signs up',
      fields: {
        userName: currentUser?.user_metadata?.username || 'John'
      }
    },
    'group-invite': {
      name: 'Group Invitation',
      description: 'Invite users to join a group',
      fields: {
        inviterName: currentUser?.user_metadata?.username || 'John',
        groupName: 'NFL Sunday Squad',
        groupId: '123',
        groupBalance: 1250.00,
        memberCount: 8,
        personalMessage: 'Hey! Join our group for the upcoming NFL season. We pool funds for weekly bets!'
      }
    },
    transaction: {
      name: 'Transaction Notification',
      description: 'Notify users about money movements',
      fields: {
        type: 'received', // received, sent, deposit, withdrawal
        amount: 50.00,
        fromUser: 'Sarah Johnson',
        description: 'Fantasy league winnings',
        transactionId: 'TXN-' + Date.now(),
        balance: 1300.00
      }
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    setError(null);
    setResult(null);

    try {
      let response;
      const template = templates[selectedTemplate];
      
      switch (selectedTemplate) {
        case 'welcome':
          response = await EmailService.sendWelcomeEmail(
            recipientEmail,
            template.fields.userName
          );
          break;
        
        case 'group-invite':
          response = await EmailService.sendGroupInvite({
            to: recipientEmail,
            ...template.fields
          });
          break;
        
        case 'transaction':
          response = await EmailService.sendTransactionEmail({
            to: recipientEmail,
            ...template.fields
          });
          break;
      }

      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const previewUrl = `/api/email-preview/${selectedTemplate}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Email Template Tester
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Template Selection */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Select Template
          </h2>
          
          <div className="space-y-3">
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setSelectedTemplate(key)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedTemplate === key
                    ? 'bg-purple-600 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <div className={`text-sm ${
                      selectedTemplate === key ? 'text-purple-200' : 'opacity-75'
                    }`}>
                      {template.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Send Options */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Send Test Email
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter email address"
                className={`w-full px-4 py-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={!recipientEmail || sending}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                !recipientEmail || sending
                  ? isDark
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Send className="w-4 h-4" />
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {/* Result Messages */}
          {result && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/20 text-green-500 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Email sent successfully!</div>
                <div className="text-sm opacity-90">
                  {result.message || 'Check your inbox'}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-500/20 text-red-500 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">Error sending email</div>
                <div className="text-sm opacity-90">{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Data */}
      <div className={`mt-6 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Template Data
        </h2>
        <pre className={`p-4 rounded-lg overflow-auto ${
          isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {JSON.stringify(templates[selectedTemplate].fields, null, 2)}
        </pre>
      </div>

      {/* Email Preview */}
      {showPreview && (
        <div className={`mt-6 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Email Preview
          </h2>
          <div className={`rounded-lg overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <iframe
              src={`data:text/html;charset=utf-8,${encodeURIComponent(getPreviewHTML(selectedTemplate, templates[selectedTemplate].fields))}`}
              className="w-full h-[600px]"
              title="Email Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to generate preview HTML
const getPreviewHTML = (type, data) => {
  // This is a simplified preview - in production, this would call the actual template functions
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
  `;
  
  let content = '';
  
  switch (type) {
    case 'welcome':
      content = `
        <h1>Welcome to Bankroll, ${data.userName}!</h1>
        <p>This is a preview of the welcome email template.</p>
      `;
      break;
    case 'group-invite':
      content = `
        <h1>You're invited to join ${data.groupName}!</h1>
        <p>${data.inviterName} has invited you to join their group.</p>
        <p>Group balance: $${data.groupBalance}</p>
      `;
      break;
    case 'transaction':
      content = `
        <h1>Transaction: $${data.amount} ${data.type}</h1>
        <p>Transaction ID: ${data.transactionId}</p>
      `;
      break;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>${baseStyles}</head>
      <body style="padding: 20px;">
        ${content}
        <p style="color: #666; margin-top: 40px;">
          Note: This is a simplified preview. The actual email will have full styling and formatting.
        </p>
      </body>
    </html>
  `;
};

export default EmailTest;