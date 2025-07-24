export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    address1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
}

export interface MeldConfig {
    apiKey: string;
    apiSecret: string;
    environment: 'sandbox' | 'production';
}

export interface MeldCustomer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MeldAccount {
    id: string;
    customerId: string;
    accountType: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
    status: string;
}

export interface MeldPayment {
    id: string;
    customerId: string;
    sourceAccountId: string;
    amount: number;
    currency: string;
    status: string;
    description?: string;
    createdAt: Date;
}

export interface MeldError {
    code: string;
    message: string;
    details?: any;
}
