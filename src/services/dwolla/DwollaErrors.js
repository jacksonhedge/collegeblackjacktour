// Common Dwolla error codes and their user-friendly messages
const DwollaErrors = {
  ValidationError: 'Please check your information and try again.',
  NotFound: 'The requested resource was not found.',
  Forbidden: 'You do not have permission to perform this action.',
  InvalidCredentials: 'Invalid credentials provided.',
  InvalidResourceState: 'The resource is in an invalid state for this operation.',
  DuplicateResource: 'This resource already exists.',
  InvalidFormat: 'The provided information format is invalid.',
  InvalidScope: 'The requested scope is invalid or unavailable.',
  ServerError: 'An unexpected error occurred. Please try again later.',
  ServiceUnavailable: 'The service is temporarily unavailable. Please try again later.',
  TooManyRequests: 'Too many requests. Please wait a moment and try again.',
  
  // Customer verification specific errors
  InvalidSSN: 'The provided SSN appears to be invalid.',
  InvalidDateOfBirth: 'The provided date of birth appears to be invalid.',
  InvalidAddress: 'The provided address could not be verified.',
  InvalidName: 'The provided name appears to be invalid.',
  DocumentRequired: 'Additional documentation is required for verification.',
  
  // Balance and transfer specific errors
  InsufficientFunds: 'Insufficient funds available for this transaction.',
  TransferFailed: 'The transfer could not be completed. Please try again.',
  InvalidAmount: 'The specified amount is invalid.',
  ExceedsLimit: 'This transaction exceeds the allowed limit.',
  
  // Account status errors
  AccountSuspended: 'Your account has been suspended. Please contact support.',
  AccountDeactivated: 'Your account has been deactivated.',
  VerificationRequired: 'Account verification is required to perform this action.',
  
  // Generic error handler
  getErrorMessage: function(error) {
    // If we have a specific message for this error code, return it
    if (this[error.code]) {
      return this[error.code];
    }
    
    // Check if the error message contains common patterns and return appropriate messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('ssn')) {
      return this.InvalidSSN;
    }
    if (errorMessage.includes('date of birth')) {
      return this.InvalidDateOfBirth;
    }
    if (errorMessage.includes('address')) {
      return this.InvalidAddress;
    }
    if (errorMessage.includes('funds')) {
      return this.InsufficientFunds;
    }
    if (errorMessage.includes('verification')) {
      return this.VerificationRequired;
    }
    
    // If no specific message is found, return a generic error message
    return 'An error occurred. Please try again or contact support if the problem persists.';
  }
};

export default DwollaErrors;
