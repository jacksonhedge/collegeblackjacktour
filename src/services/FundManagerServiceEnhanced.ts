import { FundManagerService } from './FundManagerService';
import EmailService from './EmailService';
import { auth } from './firebase/config';
import {
  DepositRequest,
  WithdrawalRequest,
  FundOperationResult,
  FundType
} from '../types/funds';

export class FundManagerServiceEnhanced extends FundManagerService {
  private emailService: EmailService;
  
  constructor() {
    super();
    this.emailService = new EmailService();
  }

  /**
   * Process a deposit with email notification
   */
  async deposit(request: DepositRequest): Promise<FundOperationResult> {
    const result = await super.deposit(request);
    
    // Send email notification if deposit was successful
    if (result.success && result.transactionId) {
      try {
        // Get user email
        const user = auth.currentUser;
        if (user?.email) {
          await this.emailService.sendTransactionEmail({
            to: user.email,
            type: 'deposit',
            amount: request.amount,
            currency: 'USD',
            platform: request.metadata?.platform || 'Bankroll',
            description: `Deposit to ${request.fundType} funds`,
            transactionId: result.transactionId,
            balance: result.newBalances?.[request.fundType] || 0
          });
        }
      } catch (emailError) {
        console.error('Error sending deposit email:', emailError);
        // Don't fail the deposit if email fails
      }
    }
    
    return result;
  }

  /**
   * Process a withdrawal with email notification
   */
  async withdraw(request: WithdrawalRequest): Promise<FundOperationResult> {
    const result = await super.withdraw(request);
    
    // Send email notification if withdrawal was successful
    if (result.success && result.transactionId) {
      try {
        // Get user email
        const user = auth.currentUser;
        if (user?.email) {
          await this.emailService.sendTransactionEmail({
            to: user.email,
            type: 'withdrawal',
            amount: request.amount,
            currency: 'USD',
            platform: request.metadata?.platform || 'Bankroll',
            description: `Withdrawal from cash funds`,
            transactionId: result.transactionId,
            balance: result.newBalances?.[FundType.CASH] || 0
          });
        }
      } catch (emailError) {
        console.error('Error sending withdrawal email:', emailError);
        // Don't fail the withdrawal if email fails
      }
    }
    
    return result;
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string): Promise<void> {
    try {
      await this.emailService.sendVerificationEmail(email);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const fundManagerService = new FundManagerServiceEnhanced();