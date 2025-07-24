import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const DeleteUserModal = ({ isOpen, onClose, onDelete, userName }) => {
  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  const handleDelete = () => {
    onDelete();
    setStep(1);
    onClose();
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {step === 1 && (
          <>
            <div className="flex items-center justify-center text-red-600 mb-4">
              <TrashIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Delete User Account
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete {userName}'s account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center justify-center text-red-600 mb-4">
              <ExclamationTriangleIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Final Warning
            </h3>
            <p className="text-sm text-gray-500 text-center mb-2">
              This will permanently delete:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-500 mb-6">
              <li>User's account and profile</li>
              <li>All associated data and preferences</li>
              <li>Group memberships and connections</li>
              <li>Transaction history</li>
            </ul>
            <p className="text-sm font-medium text-red-600 text-center mb-6">
              Are you absolutely sure you want to delete this account?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Go Back
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteUserModal;
