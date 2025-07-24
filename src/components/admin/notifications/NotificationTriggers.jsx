import React, { useState, useEffect } from 'react';
import { Zap, Plus, Search, Edit, Trash, Clock, CheckCircle, XCircle } from 'lucide-react';
import supabaseNotificationService from '../../../services/SupabaseNotificationService';

const NotificationTriggers = ({ adminProfile }) => {
  const [triggers, setTriggers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Trigger form state
  const [triggerForm, setTriggerForm] = useState({
    name: '',
    description: '',
    event_type: '',
    template_id: '',
    conditions: {},
    is_active: true
  });

  // Load triggers and templates
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load triggers and templates in parallel
        const [triggersData, templatesData] = await Promise.all([
          supabaseNotificationService.getNotificationTriggers(),
          supabaseNotificationService.getNotificationTemplates()
        ]);
        
        setTriggers(triggersData);
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error loading triggers data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Filter triggers
  const filteredTriggers = triggers.filter(trigger => {
    const matchesSearch = 
      trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      trigger.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trigger.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Notification Automations</h3>
          <p className="text-sm text-gray-500">
            Set up automated notifications triggered by events
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search automations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => {
              setTriggerForm({
                name: '',
                description: '',
                event_type: '',
                template_id: '',
                conditions: {},
                is_active: true
              });
              setIsEditMode(false);
              setSelectedTrigger(null);
              setShowTriggerModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Automation</span>
          </button>
        </div>
      </div>
      
      {/* Triggers list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Loading automations...</span>
        </div>
      ) : filteredTriggers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No automations found</h3>
          <p className="text-gray-500 mt-1">
            {triggers.length === 0 
              ? "You haven't created any notification automations yet."
              : "No automations match your search criteria."}
          </p>
          <button
            onClick={() => {
              setTriggerForm({
                name: '',
                description: '',
                event_type: '',
                template_id: '',
                conditions: {},
                is_active: true
              });
              setIsEditMode(false);
              setSelectedTrigger(null);
              setShowTriggerModal(true);
            }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create your first automation
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTriggers.map((trigger) => (
              <li key={trigger.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-gray-900 mr-2">{trigger.name}</h4>
                      {trigger.is_active ? (
                        <span className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{trigger.description}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <Zap className="w-3 h-3 mr-1" />
                        Event: {trigger.event_type}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Template: {trigger.template?.name || 'Unknown'}
                      </div>
                      {trigger.last_triggered_at && (
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Last triggered: {new Date(trigger.last_triggered_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setSelectedTrigger(trigger);
                        setTriggerForm({
                          name: trigger.name,
                          description: trigger.description || '',
                          event_type: trigger.event_type,
                          template_id: trigger.template_id,
                          conditions: trigger.conditions,
                          is_active: trigger.is_active
                        });
                        setIsEditMode(true);
                        setShowTriggerModal(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      title="Edit Automation"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(trigger)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      title="Delete Automation"
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
      
      {/* Placeholder for trigger modal - would be implemented in full version */}
      {showTriggerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit Automation' : 'Create Automation'}
            </h3>
            
            <p className="mb-4 bg-yellow-50 text-yellow-800 p-4 rounded-lg">
              This is a placeholder for the automation editor. In a full implementation, this would allow
              you to set up automated notifications triggered by specific events in your application.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Automation Name *
                </label>
                <input
                  type="text"
                  value={triggerForm.name}
                  onChange={(e) => setTriggerForm({...triggerForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter automation name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={triggerForm.description}
                  onChange={(e) => setTriggerForm({...triggerForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-20"
                  placeholder="Enter automation description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type *
                </label>
                <select
                  value={triggerForm.event_type}
                  onChange={(e) => setTriggerForm({...triggerForm, event_type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select an event</option>
                  <option value="user_signup">User Signup</option>
                  <option value="user_login">User Login</option>
                  <option value="profile_update">Profile Update</option>
                  <option value="payment_success">Payment Success</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="friend_request">Friend Request</option>
                  <option value="milestone_reached">Milestone Reached</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Template *
                </label>
                <select
                  value={triggerForm.template_id}
                  onChange={(e) => setTriggerForm({...triggerForm, template_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={triggerForm.is_active}
                    onChange={(e) => setTriggerForm({...triggerForm, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTriggerModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowTriggerModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {isEditMode ? 'Update Automation' : 'Create Automation'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Placeholder for delete confirmation - would be implemented in full version */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Automation</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the automation "{confirmDelete.name}"?
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

export default NotificationTriggers; 