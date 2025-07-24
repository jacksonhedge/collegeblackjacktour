import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Edit, Trash } from 'lucide-react';
import supabaseNotificationService from '../../../services/SupabaseNotificationService';

const NotificationSegments = ({ adminProfile }) => {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Segment form state
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    description: '',
    filter_query: {}
  });

  // Load segments
  useEffect(() => {
    const loadSegments = async () => {
      try {
        setLoading(true);
        const data = await supabaseNotificationService.getUserSegments();
        setSegments(data);
      } catch (error) {
        console.error('Error loading segments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSegments();
  }, []);
  
  // Filter segments
  const filteredSegments = segments.filter(segment => {
    const matchesSearch = 
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      segment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold">User Segments</h3>
          <p className="text-sm text-gray-500">
            Create and manage user segments for targeted notifications
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search segments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => {
              setSegmentForm({
                name: '',
                description: '',
                filter_query: {}
              });
              setIsEditMode(false);
              setSelectedSegment(null);
              setShowSegmentModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Segment</span>
          </button>
        </div>
      </div>
      
      {/* Segments list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Loading segments...</span>
        </div>
      ) : filteredSegments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No segments found</h3>
          <p className="text-gray-500 mt-1">
            {segments.length === 0 
              ? "You haven't created any user segments yet."
              : "No segments match your search criteria."}
          </p>
          <button
            onClick={() => {
              setSegmentForm({
                name: '',
                description: '',
                filter_query: {}
              });
              setIsEditMode(false);
              setSelectedSegment(null);
              setShowSegmentModal(true);
            }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create your first segment
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredSegments.map((segment) => (
              <li key={segment.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{segment.name}</h4>
                    <p className="text-sm text-gray-500">{segment.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {segment.estimated_reach || 0} users
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedSegment(segment);
                        setSegmentForm({
                          name: segment.name,
                          description: segment.description || '',
                          filter_query: segment.filter_query
                        });
                        setIsEditMode(true);
                        setShowSegmentModal(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      title="Edit Segment"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(segment)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      title="Delete Segment"
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Placeholder for segment modal - would be implemented in full version */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit Segment' : 'Create Segment'}
            </h3>
            
            <p className="mb-4 bg-yellow-50 text-yellow-800 p-4 rounded-lg">
              This is a placeholder for the segment editor. In a full implementation, this would allow
              you to create complex user segments based on user attributes, behavior, and engagement.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segment Name *
                </label>
                <input
                  type="text"
                  value={segmentForm.name}
                  onChange={(e) => setSegmentForm({...segmentForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter segment name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={segmentForm.description}
                  onChange={(e) => setSegmentForm({...segmentForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-20"
                  placeholder="Enter segment description"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowSegmentModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSegmentModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isEditMode ? 'Update Segment' : 'Create Segment'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Placeholder for delete confirmation - would be implemented in full version */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Segment</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the segment "{confirmDelete.name}"?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSegments; 