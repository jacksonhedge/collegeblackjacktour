// MeldService.ts
import { User } from './types';

class MeldService {
    private static instance: MeldService;
    private baseURL: string;

    private constructor() {
        // Use local server proxy endpoints
        this.baseURL = '/api/meld';
    }

    public static get shared(): MeldService {
        if (!MeldService.instance) {
            MeldService.instance = new MeldService();
        }
        return MeldService.instance;
    }

    private getHeaders(): Headers {
        return new Headers({
            'Content-Type': 'application/json'
        });
    }

    public async getMeldConnectionUrl(userId: string): Promise<string> {
        const headers = this.getHeaders();

        const connectionData = {
            externalCustomerId: userId,
            products: ['TRANSACTIONS', 'BALANCES'],
            optionalProducts: ['IDENTIFIERS', 'OWNERS'],
            accountPreferenceOverride: {
                allowRedirect: true
            }
        };

        try {
            const response = await fetch(`${this.baseURL}/link/token`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(connectionData)
            });

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error(`Invalid response from server: ${responseText}`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get Meld connection URL');
            }

            // Return the widgetUrl from the response
            return data.widgetUrl;
        } catch (error) {
            console.error('Error in getMeldConnectionUrl:', error);
            throw error;
        }
    }

    public async getLinkedAccounts(customerId: string): Promise<any[]> {
        const headers = this.getHeaders();

        try {
            const response = await fetch(`${this.baseURL}/customers/${customerId}/accounts`, {
                method: 'GET',
                headers: headers
            });

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse response as JSON:', responseText);
                throw new Error(`Invalid response from server: ${responseText}`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to get linked accounts');
            }

            return data.accounts || [];
        } catch (error) {
            console.error('Error in getLinkedAccounts:', error);
            throw error;
        }
    }
}

export default MeldService;
