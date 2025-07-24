import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import dwollaService from '../../services/dwolla/DwollaService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function DwollaSetupForm() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    birthday: '',
    ssn: '',
    address1: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await dwollaService.createDwollaCustomer({
        ...formData,
        id: currentUser.uid
      });
      // Refresh the page to show the balance widget
      window.location.reload();
    } catch (err) {
      console.error('Error creating Dwolla customer:', err);
      setError(err.message || 'Failed to create Dwolla account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (currentUser?.dwollaCustomerId) {
    return null;
  }

  return (
    <Card className="bg-gray-900/40 border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white">Setup Dwolla Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Date of Birth</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">SSN</label>
              <input
                type="password"
                name="ssn"
                value={formData.ssn}
                onChange={handleChange}
                required
                placeholder="123-45-6789"
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Street Address</label>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                maxLength="2"
                placeholder="CA"
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">ZIP Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                required
                placeholder="12345"
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Setup Account'}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
