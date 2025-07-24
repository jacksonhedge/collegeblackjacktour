import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DwollaConfirmation() {
  const navigate = useNavigate();

  return (
    <Card className="p-8 text-center bg-gray-900/40 border-purple-500/20">
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-green-500/20 rounded-full">
            <PartyPopper className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white">
          Information Submitted!
        </h2>

        <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-700/50">
          <h3 className="text-lg font-semibold text-purple-200 mb-2">
            Verification in Progress
          </h3>
          
          <p className="text-purple-300">
            Please allow 12-24 hours for your bank information to be verified.
            We'll notify you when your account is ready.
          </p>
        </div>

        <button
          onClick={() => navigate('/banking')}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg 
            transition-all duration-200 transform hover:scale-105 font-medium 
            shadow-lg hover:shadow-green-500/25 hover:bg-green-600"
        >
          Continue to Banking
        </button>
      </div>
    </Card>
  );
}