import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { fraternityList } from '../data/fraternityList';

const AddFraternityForm = ({ collegeName, onSuccess, onClose }) => {
  const [selectedFraternity, setSelectedFraternity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFraternity) return;

    setLoading(true);
    try {
      const normalizedCollegeId = collegeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const fraternitiesRef = collection(db, 'colleges', normalizedCollegeId, 'fraternities');
      
      // Add the fraternity
      await addDoc(fraternitiesRef, {
        name: selectedFraternity,
        status: 'outreached',
        createdAt: new Date().toISOString()
      });

      // Update college fraternity count
      const collegeRef = doc(db, 'colleges', normalizedCollegeId);
      const collegeDoc = await getDoc(collegeRef);
      if (collegeDoc.exists()) {
        await updateDoc(collegeRef, {
          fraternityCount: (collegeDoc.data().fraternityCount || 0) + 1
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding fraternity:', error);
      alert('Error adding fraternity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Add Fraternity to {collegeName}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Fraternity
              </label>
              <select
                value={selectedFraternity}
                onChange={(e) => setSelectedFraternity(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select a fraternity...</option>
                {fraternityList.map((fraternity) => (
                  <option key={fraternity} value={fraternity}>
                    {fraternity}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                disabled={loading || !selectedFraternity}
              >
                {loading ? 'Adding...' : 'Add Fraternity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFraternityForm;
