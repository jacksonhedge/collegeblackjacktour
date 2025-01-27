import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import AdminCollegeList from '../components/AdminCollegeList';
import CollegeList from '../components/CollegeList';

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
);

const StatsBox = ({ title, value, info, isLoading }) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
    <div className="flex items-center mb-2">
      <span className="text-lg font-semibold">{title}</span>
      {info && (
        <div className="ml-1 group relative">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="hidden group-hover:block absolute z-10 w-48 p-2 mt-1 text-sm text-gray-500 bg-white rounded-lg shadow-lg">
            {info}
          </div>
        </div>
      )}
    </div>
    <div className="h-10 flex items-center justify-center">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      )}
    </div>
  </div>
);

const AdminCollegesPage = () => {
  const [view, setView] = useState('all'); // 'all' or 'active'
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFraternities: 0,
    inContact: 0,
    scheduling: 0,
    eventsScheduled: 0,
    eventsCompleted: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const db = getFirestore();
      let totalFrats = 0;
      let inContactCount = 0;
      let schedulingCount = 0;
      let scheduledCount = 0;
      let completedCount = 0;

      setIsLoading(true);
      try {
        // Get all colleges
        const collegesRef = collection(db, 'colleges');
        const collegesSnapshot = await getDocs(collegesRef);

        // For each college, get fraternities
        for (const collegeDoc of collegesSnapshot.docs) {
          const fratsRef = collection(db, 'colleges', collegeDoc.id, 'fraternities');
          const fratsSnapshot = await getDocs(fratsRef);
          
          totalFrats += fratsSnapshot.docs.length;
          
          // Count fraternities based on their status
          fratsSnapshot.docs.forEach(fratDoc => {
            const data = fratDoc.data();
            if (data.status === 'in contact') inContactCount++;
            if (data.status === 'scheduling') schedulingCount++;
          });
        }

        // Get events
        const eventsRef = collection(db, 'events');
        const scheduledEvents = await getDocs(query(eventsRef, where('status', '==', 'scheduled')));
        const completedEvents = await getDocs(query(eventsRef, where('status', '==', 'completed')));
        
        scheduledCount = scheduledEvents.docs.length;
        completedCount = completedEvents.docs.length;

        await new Promise(resolve => setTimeout(resolve, 500)); // Add small delay for smoother loading state
        
        setStats({
          totalFraternities: totalFrats,
          inContact: inContactCount,
          scheduling: schedulingCount,
          eventsScheduled: scheduledCount,
          eventsCompleted: completedCount
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <StatsBox 
          title="Fraternities in Database" 
          value={stats.totalFraternities}
          isLoading={isLoading}
          info="Total number of fraternities across all colleges"
        />
        <StatsBox 
          title="Fraternities in Contact" 
          value={stats.inContact}
          isLoading={isLoading}
          info="Number of fraternities we are currently in contact with"
        />
        <StatsBox 
          title="Fraternities Scheduling" 
          value={stats.scheduling}
          isLoading={isLoading}
          info="Number of fraternities in the scheduling process"
        />
        <StatsBox 
          title="Events Scheduled" 
          value={stats.eventsScheduled}
          isLoading={isLoading}
          info="Number of upcoming scheduled events"
        />
        <StatsBox 
          title="Events Completed" 
          value={stats.eventsCompleted}
          isLoading={isLoading}
          info="Number of completed events"
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Colleges</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Colleges
          </button>
          <button
            onClick={() => setView('active')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'active'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Active Colleges
          </button>
        </div>
      </div>
      {view === 'all' ? <AdminCollegeList /> : <CollegeList />}
    </div>
  );
};

export default AdminCollegesPage;
