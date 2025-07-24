import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ChevronRight, CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle, Building2 } from 'lucide-react';
import VenmoModal from '../components/ui/VenmoModal';
import ApplePayModal from '../components/ui/ApplePayModal';
import CashAppModal from '../components/ui/CashAppModal';
import MeldModal from '../components/ui/MeldModal';

const PaymentMethodsView = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' or 'withdraw'

  const handleMethodClick = (method) => {
    setActiveModal(method);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const paymentMethods = [
    {
      id: 'bank',
      name: 'Pay with Bank',
      description: 'Connect your bank account',
      icon: <Building2 className="text-blue-500" size={24} />,
      modal: <MeldModal isOpen={activeModal === 'bank'} onClose={closeModal} type={transactionType} />
    },
    {
      id: 'venmo',
      name: 'Venmo',
      description: 'Pay with your Venmo account',
      icon: <Wallet className="text-blue-500" size={24} />,
      modal: <VenmoModal isOpen={activeModal === 'venmo'} onClose={closeModal} type={transactionType} />
    },
    {
      id: 'apple-pay',
      name: 'Apple Pay',
      description: 'Quick and secure payment with Apple Pay',
      icon: <CreditCard className="text-black" size={24} />,
      modal: <ApplePayModal isOpen={activeModal === 'apple-pay'} onClose={closeModal} type={transactionType} />
    },
    {
      id: 'cash-app',
      name: 'Cash App',
      description: 'Pay using Cash App',
      icon: <Wallet className="text-green-500" size={24} />,
      modal: <CashAppModal isOpen={activeModal === 'cash-app'} onClose={closeModal} type={transactionType} />
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex space-x-4">
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
            transactionType === 'deposit'
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setTransactionType('deposit')}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowDownCircle size={20} />
            <span>Deposit</span>
          </div>
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-lg font-semibold ${
            transactionType === 'withdraw'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={() => setTransactionType('withdraw')}
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowUpCircle size={20} />
            <span>Withdraw</span>
          </div>
        </button>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            {transactionType === 'deposit' ? 'Deposit Methods' : 'Withdrawal Methods'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                onClick={() => handleMethodClick(method.id)}
              >
                <div className="flex items-center">
                  <div className="bg-gray-800 p-2 rounded-full mr-4">
                    {method.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{method.name}</h3>
                    <p className="text-sm text-gray-400">{method.description}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Render active modal */}
      {paymentMethods.map((method) => (
        activeModal === method.id && method.modal
      ))}
    </div>
  );
};

export default PaymentMethodsView;
