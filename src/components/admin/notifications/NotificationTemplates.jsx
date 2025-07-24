import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash, MessageSquare, Bell, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import supabaseNotificationService from '../../../services/SupabaseNotificationService';

const NotificationTemplates = ({ adminProfile, refreshData }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    type: 'system',
    title_template: '',
    message_template: '',
    action_url_template: '',
    metadata_template: {}
  });

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const data = await supabaseNotificationService.getNotificationTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      filterType === 'all' || 
      template.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Reset form
  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      type: 'system',
      title_template: '',
      message_template: '',
      action_url_template: '',
      metadata_template: {}
    });
    setIsEditMode(false);
    setSelectedTemplate(null);
  };

  // Edit template
  const handleEditTemplate = (template) => {
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      type: template.type,
      title_template: template.title_template,
      message_template: template.message_template,
      action_url_template: template.action_url_template || '',
      metadata_template: template.metadata_template || {}
    });
    setSelectedTemplate(template);
    setIsEditMode(true);
    setShowTemplateModal(true);
  };

  // Save template
  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      
      if (isEditMode && selectedTemplate) {
        await supabaseNotificationService.updateNotificationTemplate(
          selectedTemplate.id,
          templateForm
        );
      } else {
        await supabaseNotificationService.createNotificationTemplate(templateForm);
      }
      
      // Refresh templates
      const updatedTemplates = await supabaseNotificationService.getNotificationTemplates();
      setTemplates(updatedTemplates);
      
      // Close modal and reset form
      setShowTemplateModal(false);
      resetTemplateForm();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    try {
      setLoading(true);
      await supabaseNotificationService.deleteNotificationTemplate(templateId);
      
      // Refresh templates
      const updatedTemplates = await supabaseNotificationService.getNotificationTemplates();
      setTemplates(updatedTemplates);
      
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. It may be in use by campaigns or triggers.');
    } finally {
      setLoading(false);
    }
  };

  // Get icon for template type
  const getTemplateTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Template Type Badge
  const TemplateTypeBadge = ({ type }) => {
    let bgColor, textColor, icon, label;
    
    switch (type) {
      case 'email':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <Mail className="w-3 h-3" />;
        label = 'Email';
        break;
      case 'push':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <Bell className="w-3 h-3" />;
        label = 'Push';
        break;
      case 'sms':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        icon = <MessageSquare className="w-3 h-3" />;
        label = 'SMS';
        break;
      case 'transaction':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <CheckCircle className="w-3 h-3" />;
        label = 'Transaction';
        break;
      case 'system':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <AlertCircle className="w-3 h-3" />;
        label = 'System';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <AlertCircle className="w-3 h-3" />;
        label = type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div>
      {/* Header with search and filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Notification Templates</h3>
          <p className="text-sm text-gray-500">
            Create and manage reusable notification templates
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="transaction">Transaction</option>
              <option value="push">Push</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            
            <button
              onClick={() => {
                resetTemplateForm();
                setShowTemplateModal(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Template</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Templates list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Loading templates...</span>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No templates found</h3>
          <p className="text-gray-500 mt-1">
            {templates.length === 0 
              ? "You haven't created any notification templates yet."
              : "No templates match your search or filter criteria."}
          </p>
          <button
            onClick={() => {
              resetTemplateForm();
              setShowTemplateModal(true);
            }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create your first template
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <li key={template.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-1">
                      <h4 className="text-lg font-medium text-gray-900 mr-2">{template.name}</h4>
                      <TemplateTypeBadge type={template.type} />
                    </div>
                    <p className="text-sm text-gray-500">{template.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="line-clamp-1"><strong>Title:</strong> {template.title_template}</div>
                      <div className="line-clamp-2"><strong>Message:</strong> {template.message_template}</div>
                      {template.action_url_template && (
                        <div className="line-clamp-1"><strong>Action URL:</strong> {template.action_url_template}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      title="Edit Template"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(template)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      title="Delete Template"
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
      
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit Template' : 'Create Template'}
            </h3>
            
            <div className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template name"
                  required
                />
              </div>
              
              {/* Template Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter template description"
                />
              </div>
              
              {/* Template Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Type *
                </label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({...templateForm, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="system">System</option>
                  <option value="transaction">Transaction</option>
                  <option value="friend_request">Friend Request</option>
                  <option value="payment">Payment</option>
                  <option value="promo">Promotional</option>
                  <option value="game">Game</option>
                </select>
              </div>
              
              {/* Title Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title Template *
                </label>
                <input
                  type="text"
                  value={templateForm.title_template}
                  onChange={(e) => setTemplateForm({...templateForm, title_template: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title template"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use variables like {{username}} in the template.
                </p>
              </div>
              
              {/* Message Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Template *
                </label>
                <textarea
                  value={templateForm.message_template}
                  onChange={(e) => setTemplateForm({...templateForm, message_template: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification message template"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use variables like {{username}}, {{amount}}, etc. in the template.
                </p>
              </div>
              
              {/* Action URL Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action URL Template
                </label>
                <input
                  type="text"
                  value={templateForm.action_url_template}
                  onChange={(e) => setTemplateForm({...templateForm, action_url_template: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter action URL template (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This URL will be opened when the user clicks on the notification.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  resetTemplateForm();
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={loading || !templateForm.name || !templateForm.title_template || !templateForm.message_template}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Delete Template</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the template "{confirmDelete.name}"?
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTemplate(confirmDelete.id)}
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

export default NotificationTemplates; 