export type NotificationPriority = 'high' | 'medium' | 'low';
export type NotificationChannel = 'email' | 'push';

export interface NotificationTemplate {
  type: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  defaultChannels: NotificationChannel[];
  requiredVariables?: string[];
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  pushToken?: string | null;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  SECURITY_ALERT: {
    type: 'SECURITY_ALERT',
    title: 'Security Alert',
    body: 'Suspicious activity detected from {{deviceInfo}} in {{location}} at {{time}}',
    priority: 'high',
    defaultChannels: ['email', 'push'],
    requiredVariables: ['deviceInfo', 'location', 'time']
  },
  PAYMENT_RECEIVED: {
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    body: 'You received {{amount}} from {{sender}}',
    priority: 'medium',
    defaultChannels: ['email', 'push'],
    requiredVariables: ['amount', 'sender']
  },
  BONUS_RECEIVED: {
    type: 'BONUS_RECEIVED',
    title: 'Bonus Received',
    body: 'You received a {{amount}} bonus!',
    priority: 'medium',
    defaultChannels: ['email', 'push'],
    requiredVariables: ['amount']
  },
  WALLET_REDEEMABLE: {
    type: 'WALLET_REDEEMABLE',
    title: 'Wallet Ready for Redemption',
    body: 'Your {{walletName}} wallet balance has reached {{amount}} and is now redeemable!',
    priority: 'medium',
    defaultChannels: ['email', 'push'],
    requiredVariables: ['walletName', 'amount']
  },
  TEST_NOTIFICATION: {
    type: 'TEST_NOTIFICATION',
    title: 'Test Notification',
    body: 'This is a test notification.',
    priority: 'low',
    defaultChannels: ['email', 'push']
  }
};
