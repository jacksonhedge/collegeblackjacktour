import { supabase } from '../config/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export interface P2PTransfer {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'transfer' | 'request' | 'split';
  description?: string;
  category?: string;
  metadata?: any;
  risk_score?: number;
  created_at: string;
  completed_at?: string;
}

export interface PaymentRequest {
  id: string;
  requester_id: string;
  payer_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  description?: string;
  expires_at?: string;
  created_at: string;
}

export interface TransferLimits {
  daily_limit: number;
  weekly_limit: number;
  monthly_limit: number;
  per_transaction_limit: number;
  daily_spent: number;
  weekly_spent: number;
  monthly_spent: number;
}

export interface SecurityVerification {
  requiresPIN: boolean;
  requiresBiometric: boolean;
  requires2FA: boolean;
  requiresEmailConfirmation: boolean;
}

class P2PTransferService {
  private static instance: P2PTransferService;

  private constructor() {}

  public static getInstance(): P2PTransferService {
    if (!P2PTransferService.instance) {
      P2PTransferService.instance = new P2PTransferService();
    }
    return P2PTransferService.instance;
  }

  // Search users by username, email, or phone
  async searchUsers(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, avatar_url')
      .or(`username.ilike.%${query}%, email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  // Get user's transfer limits
  async getUserLimits(userId: string): Promise<TransferLimits> {
    const { data, error } = await supabase
      .from('user_limits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Return default limits if not found
      return {
        daily_limit: 2500,
        weekly_limit: 10000,
        monthly_limit: 25000,
        per_transaction_limit: 1000,
        daily_spent: 0,
        weekly_spent: 0,
        monthly_spent: 0
      };
    }

    return data;
  }

  // Check if transfer amount is within limits
  async checkTransferLimits(userId: string, amount: number): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getUserLimits(userId);

    if (amount > limits.per_transaction_limit) {
      return { allowed: false, reason: `Amount exceeds per-transaction limit of $${limits.per_transaction_limit}` };
    }

    if (limits.daily_spent + amount > limits.daily_limit) {
      return { allowed: false, reason: `Amount exceeds daily limit of $${limits.daily_limit}` };
    }

    if (limits.weekly_spent + amount > limits.weekly_limit) {
      return { allowed: false, reason: `Amount exceeds weekly limit of $${limits.weekly_limit}` };
    }

    if (limits.monthly_spent + amount > limits.monthly_limit) {
      return { allowed: false, reason: `Amount exceeds monthly limit of $${limits.monthly_limit}` };
    }

    return { allowed: true };
  }

  // Get required security verification for transfer
  getRequiredVerification(amount: number, receiverId: string, isTrusted: boolean = false): SecurityVerification {
    const isHighAmount = amount > 500;
    const isVeryHighAmount = amount > 1000;

    return {
      requiresPIN: true, // Always require PIN
      requiresBiometric: isHighAmount,
      requires2FA: isVeryHighAmount && !isTrusted,
      requiresEmailConfirmation: isVeryHighAmount
    };
  }

  // Initiate P2P transfer
  async initiateTransfer(
    senderId: string,
    receiverId: string,
    amount: number,
    description?: string,
    metadata?: any
  ): Promise<P2PTransfer> {
    // Check limits
    const limitCheck = await this.checkTransferLimits(senderId, amount);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason);
    }

    // Check sender balance
    const senderBalance = await this.getUserBalance(senderId);
    if (senderBalance < amount) {
      throw new Error('Insufficient balance');
    }

    // Create transfer record
    const transfer: Partial<P2PTransfer> = {
      id: uuidv4(),
      sender_id: senderId,
      receiver_id: receiverId,
      amount,
      currency: 'USD',
      status: 'pending',
      type: 'transfer',
      description,
      metadata,
      risk_score: await this.calculateRiskScore(senderId, receiverId, amount),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('p2p_transfers')
      .insert(transfer)
      .select()
      .single();

    if (error) throw error;

    // Process the transfer asynchronously
    this.processTransfer(data.id);

    return data;
  }

  // Process transfer (called asynchronously)
  private async processTransfer(transferId: string): Promise<void> {
    try {
      // Get transfer details
      const { data: transfer, error } = await supabase
        .from('p2p_transfers')
        .select('*')
        .eq('id', transferId)
        .single();

      if (error || !transfer) throw new Error('Transfer not found');

      // Update status to processing
      await supabase
        .from('p2p_transfers')
        .update({ status: 'processing' })
        .eq('id', transferId);

      // Perform the actual transfer
      await this.executeTransfer(transfer);

      // Update status to completed
      await supabase
        .from('p2p_transfers')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', transferId);

      // Update user limits
      await this.updateUserLimits(transfer.sender_id, transfer.amount);

      // Send notifications
      await this.sendTransferNotifications(transfer);

    } catch (error) {
      console.error('Transfer processing error:', error);
      
      // Update status to failed
      await supabase
        .from('p2p_transfers')
        .update({ 
          status: 'failed',
          metadata: { error: error.message }
        })
        .eq('id', transferId);
    }
  }

  // Execute the actual balance transfer
  private async executeTransfer(transfer: P2PTransfer): Promise<void> {
    // Start a Supabase transaction
    const { error: debitError } = await supabase.rpc('transfer_funds', {
      sender_id: transfer.sender_id,
      receiver_id: transfer.receiver_id,
      amount: transfer.amount,
      transfer_id: transfer.id
    });

    if (debitError) throw debitError;
  }

  // Get user's wallet balance
  private async getUserBalance(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.balance || 0;
  }

  // Calculate risk score for transfer
  private async calculateRiskScore(senderId: string, receiverId: string, amount: number): Promise<number> {
    // Simple risk scoring - in production, use ML model
    let riskScore = 0;

    // High amount increases risk
    if (amount > 1000) riskScore += 0.2;
    if (amount > 5000) riskScore += 0.3;

    // Check if users have transacted before
    const { data: previousTransfers } = await supabase
      .from('p2p_transfers')
      .select('id')
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('status', 'completed')
      .limit(1);

    // First time sending to this user increases risk
    if (!previousTransfers || previousTransfers.length === 0) {
      riskScore += 0.2;
    }

    // Check sender's account age
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('id', senderId)
      .single();

    if (senderProfile) {
      const accountAge = Date.now() - new Date(senderProfile.created_at).getTime();
      const daysOld = accountAge / (1000 * 60 * 60 * 24);
      
      // New accounts have higher risk
      if (daysOld < 7) riskScore += 0.3;
      else if (daysOld < 30) riskScore += 0.1;
    }

    return Math.min(riskScore, 1); // Cap at 1
  }

  // Update user's spending limits
  private async updateUserLimits(userId: string, amount: number): Promise<void> {
    const { error } = await supabase.rpc('update_user_spending', {
      user_id: userId,
      amount: amount
    });

    if (error) console.error('Error updating user limits:', error);
  }

  // Send transfer notifications
  private async sendTransferNotifications(transfer: P2PTransfer): Promise<void> {
    // Get user details
    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, username')
      .in('id', [transfer.sender_id, transfer.receiver_id]);

    if (!users || users.length < 2) return;

    const sender = users.find(u => u.id === transfer.sender_id);
    const receiver = users.find(u => u.id === transfer.receiver_id);

    // Send to receiver
    await this.sendNotification(receiver.id, {
      title: 'Money Received!',
      body: `${sender.username} sent you $${transfer.amount.toFixed(2)}`,
      data: { type: 'p2p_received', transferId: transfer.id }
    });

    // Send to sender
    await this.sendNotification(sender.id, {
      title: 'Payment Sent',
      body: `You sent $${transfer.amount.toFixed(2)} to ${receiver.username}`,
      data: { type: 'p2p_sent', transferId: transfer.id }
    });
  }

  // Send notification (implement with your notification service)
  private async sendNotification(userId: string, notification: any): Promise<void> {
    // TODO: Integrate with your notification service
    console.log('Sending notification:', { userId, notification });
  }

  // Create payment request
  async createPaymentRequest(
    requesterId: string,
    payerId: string,
    amount: number,
    description?: string,
    expiresIn?: number // hours
  ): Promise<PaymentRequest> {
    const request: Partial<PaymentRequest> = {
      id: uuidv4(),
      requester_id: requesterId,
      payer_id: payerId,
      amount,
      status: 'pending',
      description,
      created_at: new Date().toISOString()
    };

    if (expiresIn) {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expiresIn);
      request.expires_at = expiresAt.toISOString();
    }

    const { data, error } = await supabase
      .from('payment_requests')
      .insert(request)
      .select()
      .single();

    if (error) throw error;

    // Send notification to payer
    await this.sendPaymentRequestNotification(data);

    return data;
  }

  // Send payment request notification
  private async sendPaymentRequestNotification(request: PaymentRequest): Promise<void> {
    const { data: requester } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', request.requester_id)
      .single();

    if (requester) {
      await this.sendNotification(request.payer_id, {
        title: 'Payment Request',
        body: `${requester.username} requested $${request.amount.toFixed(2)}`,
        data: { type: 'payment_request', requestId: request.id }
      });
    }
  }

  // Pay a payment request
  async payRequest(requestId: string, payerId: string): Promise<P2PTransfer> {
    // Get request details
    const { data: request, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('id', requestId)
      .eq('payer_id', payerId)
      .eq('status', 'pending')
      .single();

    if (error || !request) throw new Error('Request not found or already paid');

    // Check if expired
    if (request.expires_at && new Date(request.expires_at) < new Date()) {
      throw new Error('Payment request has expired');
    }

    // Create transfer
    const transfer = await this.initiateTransfer(
      payerId,
      request.requester_id,
      request.amount,
      request.description,
      { payment_request_id: requestId }
    );

    // Update request status
    await supabase
      .from('payment_requests')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString(),
        transfer_id: transfer.id
      })
      .eq('id', requestId);

    return transfer;
  }

  // Get transfer history
  async getTransferHistory(userId: string, limit: number = 50): Promise<P2PTransfer[]> {
    const { data, error } = await supabase
      .from('p2p_transfers')
      .select(`
        *,
        sender:profiles!p2p_transfers_sender_id_fkey(id, username, avatar_url),
        receiver:profiles!p2p_transfers_receiver_id_fkey(id, username, avatar_url)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get pending payment requests
  async getPendingRequests(userId: string): Promise<PaymentRequest[]> {
    const { data, error } = await supabase
      .from('payment_requests')
      .select(`
        *,
        requester:profiles!payment_requests_requester_id_fkey(id, username, avatar_url)
      `)
      .eq('payer_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

export default P2PTransferService.getInstance();