import React, { useState } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { supabase } from '../services/supabase/config';
import { toast } from 'react-hot-toast';
import { Mail, Send, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const TestEmails = () => {
  const { currentUser } = useAuth();
  const [testEmail, setTestEmail] = useState(currentUser?.email || '');
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});

  const emailTemplates = [
    {
      type: 'test',
      name: 'Test Email',
      description: 'Tests the email system',
      icon: '🧪',
      data: {
        timestamp: new Date().toISOString()
      }
    },
    {
      type: 'group-invite',
      name: 'Group Invite',
      description: 'Invitation to join a group',
      icon: '🎯',
      data: {
        inviterName: 'John Doe',
        groupName: 'Weekend Warriors',
        groupEmoji: '🏈',
        groupBalance: 150.00,
        memberCount: 5,
        winRate: 65,
        personalMessage: 'Hey! Join our fantasy football group. We pool money for bigger bets and track our wins together.',
        inviteLink: 'https://bankroll.live/join/group/abc123'
      }
    },
    {
      type: 'verification-code',
      name: 'Verification Code',
      description: '6-digit verification code',
      icon: '🔐',
      data: {
        code: '123456'
      }
    },
    {
      type: 'money-sent',
      name: 'Money Sent',
      description: 'Payment sent confirmation',
      icon: '💸',
      data: {
        amount: '50.00',
        recipientName: 'Jane Smith',
        transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString(),
        paymentMethod: 'Bankroll Balance',
        note: 'Thanks for the tickets!'
      }
    },
    {
      type: 'money-received',
      name: 'Money Received',
      description: 'Payment received notification',
      icon: '💰',
      data: {
        amount: '75.00',
        senderName: 'Mike Johnson',
        senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        note: 'For last night\'s bet winnings 🎉',
        newBalance: '425.50'
      }
    }
  ];

  const sendTestEmail = async (template) => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSending({ ...sending, [template.type]: true });

    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          type: template.type,
          data: template.data
        }
      });

      if (error) throw error;

      toast.success(`${template.name} sent to ${testEmail}`);
      setSent({ ...sent, [template.type]: true });
      
      // Reset sent status after 3 seconds
      setTimeout(() => {
        setSent(prev => ({ ...prev, [template.type]: false }));
      }, 3000);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error(`Failed to send ${template.name}`);
    } finally {
      setSending({ ...sending, [template.type]: false });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Test Email Templates</h1>
        <p className="text-gray-400">
          Send test emails to verify all templates are working correctly
        </p>
      </div>

      {/* Email Input */}
      <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Test Email Address
        </label>
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder="Enter email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 bg-gray-900 border-gray-700"
          />
          <Button
            onClick={() => setTestEmail(currentUser?.email || '')}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Use My Email
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Emails will be sent from notifications@bankroll.live
        </p>
      </div>

      {/* Email Templates */}
      <div className="space-y-4">
        {emailTemplates.map((template) => (
          <div
            key={template.type}
            className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {template.description}
                    </p>
                  </div>
                </div>
                
                {/* Template Data Preview */}
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Template Data:</p>
                  <pre className="text-xs text-gray-400 overflow-x-auto">
                    {JSON.stringify(template.data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="ml-4">
                <Button
                  onClick={() => sendTestEmail(template)}
                  disabled={sending[template.type] || !testEmail}
                  className={`min-w-[120px] ${
                    sent[template.type]
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {sending[template.type] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : sent[template.type] ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-300 mb-1">
              Email Deliverability Tips
            </h4>
            <ul className="text-sm text-blue-200/80 space-y-1 list-disc list-inside">
              <li>Check spam folder if emails don't appear in inbox</li>
              <li>Add notifications@bankroll.live to your contacts</li>
              <li>Domain is verified with SPF, DKIM, and DMARC records</li>
              <li>All emails include unsubscribe links for compliance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmails;