import { getAuth, Auth } from 'firebase/auth';
import firebaseApp from './firebase/config';

interface EmailResult {
  success: boolean;
  message?: string;
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  results?: Array<{
    email: string;
    success: boolean;
    error?: string;
  }>;
}

interface BulkInvitePayload {
  groupId: string;
  groupName: string;
  groupEmoji: string;
  emails: string[];
}

interface SendEmailPayload {
  userId: string;
  emailType: 'marketing' | 'updates' | 'groupInvites';
  templateName: string;
  templateData: {
    subject: string;
    [key: string]: any;
  };
}

class EmailService {
  private static instance: EmailService;
  private auth!: Auth;
  private baseUrl!: string;

  constructor() {
    if (EmailService.instance) {
      return EmailService.instance;
    }
    EmailService.instance = this;
    this.initialize();
  }

  private initialize(): void {
    if (!firebaseApp) {
      throw new Error('Firebase app must be initialized before creating EmailService');
    }

    try {
      this.auth = getAuth(firebaseApp);
      this.baseUrl = 'https://us-central1-bankroll-2ccb4.cloudfunctions.net';
      console.log('EmailService initialized');
    } catch (error) {
      console.error('Failed to initialize EmailService:', error);
      throw new Error('Failed to initialize EmailService');
    }
  }

  async sendEmail(
    userId: string,
    emailType: 'marketing' | 'updates' | 'groupInvites',
    templateName: string,
    templateData: { subject: string; [key: string]: any }
  ): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/sendEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          emailType,
          templateName,
          templateData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new Error(error.message || 'Failed to send email');
    }
  }

  async sendBulkGroupInvites(
    groupId: string,
    groupName: string,
    emails: string[],
    groupEmoji: string = '👥'
  ): Promise<EmailResult> {
    console.log('Starting sendBulkGroupInvites with:', {
      groupId,
      groupName,
      emailCount: emails.length,
      groupEmoji
    });

    try {
      // Input validation with detailed logging
      if (!groupId || !groupName || !Array.isArray(emails)) {
        const error = new Error('Invalid parameters for bulk invites');
        console.error('Validation failed:', {
          hasGroupId: !!groupId,
          hasGroupName: !!groupName,
          isEmailsArray: Array.isArray(emails)
        });
        throw error;
      }

      // Validate and normalize emails with logging
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails
        .map(email => email.trim().toLowerCase())
        .filter(email => emailRegex.test(email));

      console.log('Email validation results:', {
        originalCount: emails.length,
        validCount: validEmails.length,
        invalidEmails: emails.filter(email => !emailRegex.test(email.trim().toLowerCase()))
      });

      if (validEmails.length === 0) {
        throw new Error('No valid emails provided');
      }

      // Auth check with logging
      const currentUser = this.auth.currentUser;
      console.log('Auth check:', {
        isAuthenticated: !!currentUser,
        userId: currentUser?.uid
      });

      if (!currentUser) {
        throw new Error('User must be authenticated');
      }

      // Token refresh with logging
      console.log('Refreshing auth token...');
      await currentUser.getIdToken(true);
      console.log('Token refresh completed');

      const response = await fetch(`${this.baseUrl}/sendBulkGroupInvites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          groupName,
          groupEmoji,
          emails: validEmails
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send bulk invites');
      }

      const result = await response.json();
      
      console.log('API response:', result);

      // Check if the operation was successful
      if (!result?.success) {
        console.error('Function returned error:', result);
        throw new Error(result?.message || 'Failed to send invites');
      }

      // Return detailed results
      return {
        success: true,
        message: result.message || `Successfully sent ${validEmails.length} invites`,
        summary: result.summary || {
          total: validEmails.length,
          successful: validEmails.length,
          failed: 0
        }
      };
    } catch (error: any) {
      console.error('Error in sendBulkGroupInvites:', {
        error,
        code: error.code,
        message: error.message,
        stack: error.stack,
        data: error.data
      });

      // Enhanced error handling
      if (error.code === 'unauthenticated' || error.message?.includes('must be logged in')) {
        throw new Error('Please sign in to send invites');
      } else if (error.code === 'internal') {
        throw new Error('Unable to send invites at this time. Please try again later.');
      } else if (error.code === 'not-found') {
        throw new Error('The email service is not properly configured. Please contact support.');
      } else if (error.code === 'deadline-exceeded') {
        throw new Error('The request timed out. Please try again.');
      }
      
      throw error;
    }
  }

  async handleUnsubscribe(token: string): Promise<EmailResult> {
    try {
      const response = await fetch(`${this.baseUrl}/handleUnsubscribe?token=${encodeURIComponent(token)}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process unsubscribe request');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error handling unsubscribe:', error);
      throw new Error(error.message || 'Failed to process unsubscribe request');
    }
  }
}

export const emailService = new EmailService();
