import { supabase } from '../config/supabaseClient';

export interface BankAccount {
  id?: string;
  user_id: string;
  meld_account_id: string;
  institution_name: string;
  account_name: string;
  account_type: string;
  last_four: string;
  status: 'active' | 'inactive' | 'suspended';
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ACHTransfer {
  id?: string;
  user_id: string;
  meld_transfer_id: string;
  bank_account_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

class MeldSupabaseService {
  // Save Meld customer ID to user profile
  async saveMeldCustomerId(userId: string, meldCustomerId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        meld_customer_id: meldCustomerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error saving Meld customer ID:', error);
      throw error;
    }
  }

  // Get Meld customer ID from user profile
  async getMeldCustomerId(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('meld_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting Meld customer ID:', error);
      return null;
    }

    return data?.meld_customer_id || null;
  }

  // Save connected bank account
  async saveBankAccount(account: BankAccount): Promise<BankAccount> {
    // If this is the first account, make it default
    const { data: existingAccounts } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('user_id', account.user_id);

    if (!existingAccounts || existingAccounts.length === 0) {
      account.is_default = true;
    }

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(account)
      .select()
      .single();

    if (error) {
      console.error('Error saving bank account:', error);
      throw error;
    }

    // Update user profile to mark bank as connected
    await supabase
      .from('profiles')
      .update({ 
        bank_connected: true,
        bank_connected_at: new Date().toISOString()
      })
      .eq('id', account.user_id);

    return data;
  }

  // Get user's bank accounts
  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting bank accounts:', error);
      throw error;
    }

    return data || [];
  }

  // Set default bank account
  async setDefaultBankAccount(userId: string, accountId: string): Promise<void> {
    // First, unset all defaults
    await supabase
      .from('bank_accounts')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the new default
    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_default: true })
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default bank account:', error);
      throw error;
    }
  }

  // Remove bank account
  async removeBankAccount(userId: string, accountId: string): Promise<void> {
    const { error } = await supabase
      .from('bank_accounts')
      .update({ status: 'inactive' })
      .eq('id', accountId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error removing bank account:', error);
      throw error;
    }

    // Check if user has any other active accounts
    const { data: remainingAccounts } = await supabase
      .from('bank_accounts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (!remainingAccounts || remainingAccounts.length === 0) {
      // Update profile to mark bank as not connected
      await supabase
        .from('profiles')
        .update({ bank_connected: false })
        .eq('id', userId);
    }
  }

  // Save ACH transfer
  async saveACHTransfer(transfer: ACHTransfer): Promise<ACHTransfer> {
    const { data, error } = await supabase
      .from('ach_transfers')
      .insert(transfer)
      .select()
      .single();

    if (error) {
      console.error('Error saving ACH transfer:', error);
      throw error;
    }

    return data;
  }

  // Update ACH transfer status
  async updateTransferStatus(
    transferId: string, 
    status: ACHTransfer['status'],
    completedAt?: string
  ): Promise<void> {
    const updateData: any = { status };
    if (completedAt) {
      updateData.completed_at = completedAt;
    }

    const { error } = await supabase
      .from('ach_transfers')
      .update(updateData)
      .eq('meld_transfer_id', transferId);

    if (error) {
      console.error('Error updating transfer status:', error);
      throw error;
    }
  }

  // Get user's ACH transfers
  async getACHTransfers(userId: string, limit: number = 50): Promise<ACHTransfer[]> {
    const { data, error } = await supabase
      .from('ach_transfers')
      .select(`
        *,
        bank_account:bank_accounts(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting ACH transfers:', error);
      throw error;
    }

    return data || [];
  }

  // Get specific transfer
  async getACHTransfer(transferId: string): Promise<ACHTransfer | null> {
    const { data, error } = await supabase
      .from('ach_transfers')
      .select(`
        *,
        bank_account:bank_accounts(*)
      `)
      .eq('meld_transfer_id', transferId)
      .single();

    if (error) {
      console.error('Error getting ACH transfer:', error);
      return null;
    }

    return data;
  }
}

export const meldSupabaseService = new MeldSupabaseService();