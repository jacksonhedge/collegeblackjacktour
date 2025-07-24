import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import dwollaService from '@/services/DwollaService';
import { handleDwollaError } from '@/services/DwollaErrors';

export default function DwollaSetupForm() {
  const { currentUser, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    address1: '',
    city: '',
    state: '',
    postalCode: '',
    ssn: '',
    birthday: currentUser?.birthday || ''
  });

  const validateState = (state) => {
    const stateRegex = /^[A-Z]{2}$/;
    return stateRegex.test(state);
  };

  const validatePostalCode = (code) => {
    const postalRegex = /^\d{5}$/;
    return postalRegex.test(code);
  };

  const validateSSN = (ssn) => {
    const ssnRegex = /^\d{4}$/;
    return ssnRegex.test(ssn);
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.address1 &&
      formData.city &&
      validateState(formData.state) &&
      validatePostalCode(formData.postalCode) &&
      validateSSN(formData.ssn)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleStateChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      state: value.toUpperCase()
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await dwollaService.createDwollaCustomer({
        ...formData,
        id: currentUser.uid
      });
      
      await refreshUser();
    } catch (err) {
      const dwollaError = handleDwollaError(err);
      setError(dwollaError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gray-900/40 border-purple-500/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          Setup Dwolla Account
        </h2>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Street Address
            </label>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              State (2-letter code)
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleStateChange}
              maxLength={2}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white uppercase"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              maxLength={5}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Last 4 digits of SSN
            </label>
            <input
              type="password"
              name="ssn"
              value={formData.ssn}
              onChange={handleInputChange}
              maxLength={4}
              className="w-full px-4 py-2 bg-gray-800/50 border border-purple-500/20 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className={`w-full px-6 py-3 mt-6 rounded-lg font-medium transition-all duration-200
            ${isFormValid() && !isLoading 
              ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105' 
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </div>
          ) : (
            'Create Dwolla Account'
          )}
        </button>
      </form>
    </Card>
  );
}