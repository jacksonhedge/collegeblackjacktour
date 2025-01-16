import React from 'react';
import CollegeList from '../components/CollegeList';
import { getFraternityData } from '../firebase/getFraternityData';

const AdminCollegesPage = () => {
  const handleGetFraternityData = async () => {
    try {
      const data = await getFraternityData();
      console.log('Fraternity data:', data);
    } catch (error) {
      console.error('Error fetching fraternity data:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Colleges</h1>
        <button
          onClick={handleGetFraternityData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Get Fraternity Data
        </button>
      </div>
      <CollegeList />
    </div>
  );
};

export default AdminCollegesPage;
