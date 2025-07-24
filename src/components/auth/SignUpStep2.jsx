import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Input, Button, Card } from '../ui';
import { Switch } from '@headlessui/react';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import SignupLoadingScreen from './SignupLoadingScreen';

const SignUpStep2 = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifyTournaments, setNotifyTournaments] = useState(true);
  const [notifyLeagues, setNotifyLeagues] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(true);
  const { completeSignup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const userData = {
        firstName,
        lastName,
        username,
        phoneNumber,
        promoCode,
        notificationPreferences: {
          email: true,
          tournaments: notifyTournaments,
          leagues: notifyLeagues,
          promotions: notifyPromotions
        }
      };

      // Navigate to welcome flow immediately
      navigate('/welcome', { replace: true });
      
      // Complete signup in the background
      completeSignup(userData).then(() => {
        toast.success('Account created successfully!');
      }).catch(error => {
        console.error('Signup completion error:', error);
        if (error.code === 'auth/email-already-in-use' || error.message === 'Email is already in use') {
          toast.error('This email is already registered. Please try signing in instead.');
          navigate('/login', { replace: true });
        } else {
          toast.error(error.message || 'Failed to complete signup');
          navigate('/signup', { replace: true });
        }
      });
      
    } catch (error) {
      setLoading(false);
      console.error('Error in handleSubmit:', error);
      toast.error('An unexpected error occurred');
      navigate('/signup', { replace: true });
    }
  };

  const handleBack = () => {
    navigate('/signup');
  };

  return (
    <>
      {loading && <SignupLoadingScreen />}
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-900 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md space-y-6 bg-gray-800 border-gray-700">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center">
              <button
                onClick={handleBack}
                className="self-start text-gray-400 hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Complete Your Profile
              </h2>
              <p className="mt-2 text-center text-sm text-gray-400">
                Tell us a bit more about yourself
              </p>
            </div>
            <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="firstName" className="sr-only">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="sr-only">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="username" className="sr-only">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoCapitalize="none"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="sr-only">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="promoCode" className="sr-only">
                    Promo Code
                  </label>
                  <Input
                    id="promoCode"
                    name="promoCode"
                    type="text"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-300">Notification Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Bankroll Tournaments</span>
                    <span className="text-xs text-gray-400">Get notified about upcoming tournaments</span>
                  </div>
                  <Switch
                    checked={notifyTournaments}
                    onChange={setNotifyTournaments}
                    className={`${
                      notifyTournaments ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                  >
                    <span
                      className={`${
                        notifyTournaments ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Bankroll Leagues</span>
                    <span className="text-xs text-gray-400">Stay updated on league activities</span>
                  </div>
                  <Switch
                    checked={notifyLeagues}
                    onChange={setNotifyLeagues}
                    className={`${
                      notifyLeagues ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                  >
                    <span
                      className={`${
                        notifyLeagues ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">Free Money Promotions</span>
                    <span className="text-xs text-gray-400">Don't miss out on free money opportunities</span>
                  </div>
                  <Switch
                    checked={notifyPromotions}
                    onChange={setNotifyPromotions}
                    className={`${
                      notifyPromotions ? 'bg-blue-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
                  >
                    <span
                      className={`${
                        notifyPromotions ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </Switch>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]"
                  disabled={loading}
                >
                  Complete Signup
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SignUpStep2;
