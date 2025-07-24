import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase/client';

const TestEmailButton = ({ userEmail = 'jacksonfitzgerald25@gmail.com' }) => {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [message, setMessage] = useState('');

  const sendTestEmail = async () => {
    setSending(true);
    setStatus(null);
    setMessage('');

    try {
      const timestamp = new Date().toLocaleString();
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          to: userEmail,
          subject: `🎉 Bankroll Test Email - ${timestamp}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, Arial, sans-serif; background: #f5f5f5;">
              <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 48px 32px; text-align: center;">
                  <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 40px;">
                    💰
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 600;">Bankroll Email Test</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your notifications are working!</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 48px 32px;">
                  <h2 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 24px;">Hi there! 👋</h2>
                  
                  <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                    This is a test email from your Bankroll notification system. If you're seeing this, everything is working perfectly!
                  </p>
                  
                  <!-- Success Box -->
                  <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 24px; margin: 32px 0;">
                    <h3 style="color: #166534; margin: 0 0 12px 0; font-size: 18px; display: flex; align-items: center;">
                      ✅ System Status: Operational
                    </h3>
                    <ul style="color: #166534; margin: 0; padding-left: 20px; line-height: 1.8;">
                      <li>Email delivery: Working</li>
                      <li>Supabase Edge Functions: Active</li>
                      <li>SendGrid integration: Connected</li>
                      <li>Notification system: Ready</li>
                    </ul>
                  </div>
                  
                  <!-- What You Can Receive -->
                  <div style="margin: 32px 0;">
                    <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px;">📬 Notifications You'll Receive:</h3>
                    <div style="display: grid; gap: 12px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: #e0e7ff; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          💸
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1a1a1a;">Transaction Alerts</div>
                          <div style="font-size: 14px; color: #6b7280;">Deposits, withdrawals, and transfers</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: #fef3c7; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          👥
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1a1a1a;">Group Updates</div>
                          <div style="font-size: 14px; color: #6b7280;">Invites and group activity</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: #ecfccb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                          🎁
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1a1a1a;">Promotions</div>
                          <div style="font-size: 14px; color: #6b7280;">Special offers and bonuses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Technical Details -->
                  <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 32px 0;">
                    <h4 style="color: #4b5563; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Technical Details</h4>
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                      <div><strong>Sent to:</strong> ${userEmail}</div>
                      <div><strong>Time:</strong> ${timestamp}</div>
                      <div><strong>Provider:</strong> Supabase Edge Functions + SendGrid</div>
                      <div><strong>From:</strong> noreply@bankroll.live</div>
                    </div>
                  </div>
                  
                  <!-- CTA -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="https://bankroll.live/settings/notifications" 
                       style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Manage Notifications
                    </a>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 32px 0 0 0;">
                    You're receiving this because you requested a test email from your Bankroll notification settings.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">
                    © 2024 Bankroll. All rights reserved.
                  </p>
                  <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                    Powered by Supabase Edge Functions
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `Bankroll Email Test

Hi there!

This is a test email from your Bankroll notification system. If you're seeing this, everything is working perfectly!

✅ System Status: Operational
- Email delivery: Working
- Supabase Edge Functions: Active
- SendGrid integration: Connected
- Notification system: Ready

Sent to: ${userEmail}
Time: ${timestamp}

Manage your notifications: https://bankroll.live/settings/notifications

© 2024 Bankroll. All rights reserved.`
        }
      });

      if (error) throw error;

      setStatus('success');
      setMessage(`Test email sent to ${userEmail}!`);
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus(null);
        setMessage('');
      }, 5000);

    } catch (error) {
      console.error('Error sending test email:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to send test email');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setStatus(null);
        setMessage('');
      }, 5000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Test Email Delivery
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Send a test email to verify your notification system is working
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Test email will be sent to:</span>
            <br />
            <span className="text-gray-900 font-mono">{userEmail}</span>
          </p>
        </div>

        <button
          onClick={sendTestEmail}
          disabled={sending}
          className={`
            w-full py-3 px-4 rounded-lg font-medium 
            flex items-center justify-center gap-2
            transition-all duration-200
            ${sending 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md'
            }
          `}
        >
          {sending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Test Email
            </>
          )}
        </button>

        {/* Status Messages */}
        {status && (
          <div className={`
            p-4 rounded-lg flex items-start gap-3
            ${status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}
          `}>
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-medium">
                {status === 'success' ? 'Success!' : 'Error'}
              </p>
              <p className="text-sm mt-1">
                {message}
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Emails are sent via Supabase Edge Functions</p>
          <p>• Check your spam folder if you don't see it</p>
          <p>• Sender will show as "noreply@bankroll.live"</p>
        </div>
      </div>
    </div>
  );
};

export default TestEmailButton;