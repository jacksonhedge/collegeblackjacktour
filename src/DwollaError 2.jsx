// src/services/DwollaErrors.js

export class DwollaError extends Error {
    constructor(message, code = '') {
      super(message);
      this.name = 'DwollaError';
      this.code = code;
    }
  }
  
  export const DwollaErrorCodes = {
    NO_ACCESS_TOKEN: 'no_access_token',
    AUTHENTICATION_FAILED: 'authentication_failed',
    CUSTOMER_NOT_FOUND: 'customer_not_found',
    INVALID_VERIFICATION_DATA: 'invalid_verification_data',
    SERVER_ERROR: 'server_error',
    NETWORK_ERROR: 'network_error',
    INVALID_RESPONSE: 'invalid_response',
    RESOURCE_NOT_FOUND: 'resource_not_found',
    NO_BALANCE_ACCOUNT: 'no_balance_account',
    INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
    INVALID_DATA: 'invalid_data',
    INVALID_URL: 'invalid_url',
    CUSTOMER_ID_NOT_FOUND: 'customer_id_not_found'
  };
  
  // Create specific error classes for common scenarios
  export class NoAccessTokenError extends DwollaError {
    constructor() {
      super('No access token available', DwollaErrorCodes.NO_ACCESS_TOKEN);
    }
  }
  
  export class AuthenticationError extends DwollaError {
    constructor() {
      super('Authentication failed', DwollaErrorCodes.AUTHENTICATION_FAILED);
    }
  }
  
  export class CustomerNotFoundError extends DwollaError {
    constructor() {
      super('Customer not found', DwollaErrorCodes.CUSTOMER_NOT_FOUND);
    }
  }
  
  export class InvalidVerificationDataError extends DwollaError {
    constructor(details = '') {
      super(`Invalid verification data${details ? ': ' + details : ''}`, 
        DwollaErrorCodes.INVALID_VERIFICATION_DATA);
    }
  }
  
  export class ServerError extends DwollaError {
    constructor(message = 'Server error occurred') {
      super(message, DwollaErrorCodes.SERVER_ERROR);
    }
  }
  
  export class NetworkError extends DwollaError {
    constructor() {
      super('Network error occurred', DwollaErrorCodes.NETWORK_ERROR);
    }
  }
  
  // Function to handle Dwolla API errors
  export function handleDwollaError(error) {
    if (error instanceof DwollaError) {
      return error;
    }
  
    // Handle specific HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 401:
          return new AuthenticationError();
        case 404:
          return new CustomerNotFoundError();
        case 400:
          return new InvalidVerificationDataError(error.message);
        case 500:
          return new ServerError(error.message);
        default:
          return new DwollaError(error.message || 'An unknown error occurred');
      }
    }
  
    // Handle network errors
    if (error.name === 'NetworkError') {
      return new NetworkError();
    }
  
    // Default error handling
    return new DwollaError(
      error.message || 'An unexpected error occurred',
      DwollaErrorCodes.UNKNOWN
    );
  }