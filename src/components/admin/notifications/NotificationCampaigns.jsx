import React, { useState, useEffect } from 'react';
import { 
  Send, Plus, Search, Filter, Edit, Trash, Calendar, Clock, 
  BarChart, User, Users, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import supabaseNotificationService from '../../../services/SupabaseNotificationService';

const NotificationCampaigns = ({ adminProfile, refreshData }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [segments, setSegments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null);

  // New campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    template_id: '',
    segment_id: null,
    specific_users: null,
    recipientType: 'segment', // 'segment', 'specific', 'all'
    schedule_time: null,
    send_immediately: false
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch in parallel
        const [campaignsData, templatesData, segmentsData, usersData] = await Promise.all([
          supabaseNotificationService.getNotificationCampaigns(),
          supabaseNotificationService.getNotificationTemplates(),
          supabaseNotificationService.getUserSegments(),
          supabaseNotificationService.getAllUsers()
        ]);
        
        setCampaigns(campaignsData);
        setTemplates(templatesData);
        setSegments(segmentsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading campaign data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter campaigns based on search and filter criteria
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      campaign.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      campaign.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Handle campaign creation
  const handleCreateCampaign = async () => {
    try {
      setLoading(true);
      
      // Prepare specific users if selected
      let specificUsers = null;
      if (campaignForm.recipientType === 'specific' && campaignForm.selectedUserIds?.length > 0) {
        specificUsers = campaignForm.selectedUserIds;
      }
      
      // Create campaign object
      const campaignData = {
        name: campaignForm.name,
        description: campaignForm.description,
        template_id: campaignForm.template_id,
        segment_id: campaignForm.recipientType === 'segment' ? campaignForm.segment_id : null,
        specific_users: specificUsers,
        schedule_time: campaignForm.schedule_time,
        send_immediately: campaignForm.send_immediately
      };
      
      // Create the campaign
      const newCampaignId = await supabaseNotificationService.createNotificationCampaign(campaignData);
      
      // If send immediately, send it now
      if (campaignForm.send_immediately) {
        await supabaseNotificationService.sendNotificationCampaign(newCampaignId);
      }
      
      // Refresh campaigns list
      const updatedCampaigns = await supabaseNotificationService.getNotificationCampaigns();
      setCampaigns(updatedCampaigns);
      
      // Close modal and reset form
      setShowCampaignModal(false);
      resetCampaignForm();
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset campaign form
  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      description: '',
      template_id: '',
      segment_id: null,
      specific_users: null,
      recipientType: 'segment',
      selectedUserIds: [],
      schedule_time: null,
      send_immediately: false
    });
  };

  // Handle send campaign now
  const handleSendCampaign = async (campaignId) => {
    try {
      setLoading(true);
      
      // Send the campaign
      await supabaseNotificationService.sendNotificationCampaign(campaignId);
      
      // Refresh campaigns list
      const updatedCampaigns = await supabaseNotificationService.getNotificationCampaigns();
      setCampaigns(updatedCampaigns);
      
      setConfirmAction(null);
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get status badge for campaign
  const CampaignStatusBadge = ({ status }) => {
    let bgColor, textColor, icon;
    
    switch (status) {
      case 'completed':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        icon = <CheckCircle className="w-3 h-3" />;
        break;
      case 'scheduled':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        icon = <Calendar className="w-3 h-3" />;
        break;
      case 'sending':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        icon = <Clock className="w-3 h-3" />;
        break;
      case 'draft':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <Edit className="w-3 h-3" />;
        break;
      case 'failed':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        icon = <XCircle className="w-3 h-3" />;
        break;
      case 'cancelled':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <XCircle className="w-3 h-3" />;
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        icon = <AlertCircle className="w-3 h-3" />;
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </span>
    );
  };

  // Get recipient display text
  const getRecipientText = (campaign) => {
    if (campaign.segment_id) {
      const segment = segments.find(s => s.id === campaign.segment_id);
      return `Segment: ${segment?.name || 'Unknown'}`;
    } else if (campaign.specific_users) {
      return `${campaign.specific_users.length} specific users`;
    } else {
      return 'All users';
    }
  };

  return (
    <div>
      {/* Header with search and filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold">Notification Campaigns</h3>
          <p className="text-sm text-gray-500">
            Create and manage notification campaigns to reach your users
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full md:w-auto border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-2 items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sending">Sending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              onClick={() => {
                resetCampaignForm();
                setShowCampaignModal(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Campaign</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Campaigns list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-500">Loading campaigns...</span>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Send className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
          <p className="text-gray-500 mt-1">
            {campaigns.length === 0 
              ? "You haven't created any notification campaigns yet."
              : "No campaigns match your search or filter criteria."}
          </p>
          <button
            onClick={() => {
              resetCampaignForm();
              setShowCampaignModal(true);
            }}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-4 w-4" />
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <li key={campaign.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-1">
                      <h4 className="text-lg font-medium text-gray-900 mr-2">{campaign.name}</h4>
                      <CampaignStatusBadge status={campaign.status} />
                    </div>
                    <p className="text-sm text-gray-500">{campaign.description}</p>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <Send className="w-3 h-3 mr-1" />
                        Template: {templates.find(t => t.id === campaign.template_id)?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center">
                        {campaign.segment_id ? (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            {getRecipientText(campaign)}
                          </>
                        ) : campaign.specific_users ? (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            {getRecipientText(campaign)}
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3 mr-1" />
                            All Users
                          </>
                        )}
                      </div>
                      {campaign.schedule_time && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Scheduled: {formatDate(campaign.schedule_time)}
                        </div>
                      )}
                      {campaign.sent_at && (
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent: {formatDate(campaign.sent_at)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => setConfirmAction({
                          type: 'send',
                          id: campaign.id,
                          name: campaign.name
                        })}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                        title="Send Campaign"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    )}
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => setConfirmAction({
                          type: 'delete',
                          id: campaign.id,
                          name: campaign.name
                        })}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                        title="Delete Campaign"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // View campaign analytics
                      }}
                      className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-full"
                      title="View Analytics"
                    >
                      <BarChart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Create Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Notification Campaign</h3>
            
            <div className="space-y-4">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              
              {/* Campaign Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter campaign description"
                />
              </div>
              
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Template *
                </label>
                <select
                  value={campaignForm.template_id}
                  onChange={(e) => setCampaignForm({...campaignForm, template_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Recipient Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="recipientAll"
                      checked={campaignForm.recipientType === 'all'}
                      onChange={() => setCampaignForm({
                        ...campaignForm, 
                        recipientType: 'all',
                        segment_id: null,
                        specific_users: null,
                        selectedUserIds: []
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="recipientAll" className="ml-2 block text-sm text-gray-700">
                      All Users
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="recipientSegment"
                      checked={campaignForm.recipientType === 'segment'}
                      onChange={() => setCampaignForm({
                        ...campaignForm,
                        recipientType: 'segment',
                        specific_users: null,
                        selectedUserIds: []
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="recipientSegment" className="ml-2 block text-sm text-gray-700">
                      User Segment
                    </label>
                  </div>
                  
                  {campaignForm.recipientType === 'segment' && (
                    <div className="ml-6">
                      <select
                        value={campaignForm.segment_id || ''}
                        onChange={(e) => setCampaignForm({...campaignForm, segment_id: e.target.value})}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select a segment</option>
                        {segments.map(segment => (
                          <option key={segment.id} value={segment.id}>
                            {segment.name} ({segment.estimated_reach} users)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="recipientSpecific"
                      checked={campaignForm.recipientType === 'specific'}
                      onChange={() => setCampaignForm({
                        ...campaignForm,
                        recipientType: 'specific',
                        segment_id: null,
                        selectedUserIds: []
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="recipientSpecific" className="ml-2 block text-sm text-gray-700">
                      Specific Users
                    </label>
                  </div>
                  
                  {campaignForm.recipientType === 'specific' && (
                    <div className="ml-6 border border-gray-200 rounded-md p-2 max-h-40 overflow-y-auto">
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="w-full border border-gray-300 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-1">
                        {users.slice(0, 10).map(user => (
                          <div key={user.user_id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`user-${user.user_id}`}
                              checked={campaignForm.selectedUserIds?.includes(user.user_id)}
                              onChange={(e) => {
                                const selectedIds = campaignForm.selectedUserIds || [];
                                if (e.target.checked) {
                                  setCampaignForm({
                                    ...campaignForm,
                                    selectedUserIds: [...selectedIds, user.user_id]
                                  });
                                } else {
                                  setCampaignForm({
                                    ...campaignForm,
                                    selectedUserIds: selectedIds.filter(id => id !== user.user_id)
                                  });
                                }
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`user-${user.user_id}`} className="ml-2 block text-sm text-gray-700 truncate">
                              {user.email} {user.username ? `(${user.username})` : ''}
                            </label>
                          </div>
                        ))}
                      </div>
                      {campaignForm.selectedUserIds?.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {campaignForm.selectedUserIds.length} users selected
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Options
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="sendImmediately"
                      checked={campaignForm.send_immediately}
                      onChange={() => setCampaignForm({
                        ...campaignForm,
                        send_immediately: true,
                        schedule_time: null
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sendImmediately" className="ml-2 block text-sm text-gray-700">
                      Send immediately
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="sendLater"
                      checked={!campaignForm.send_immediately}
                      onChange={() => setCampaignForm({
                        ...campaignForm,
                        send_immediately: false,
                        schedule_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16)
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sendLater" className="ml-2 block text-sm text-gray-700">
                      Schedule for later
                    </label>
                  </div>
                  
                  {!campaignForm.send_immediately && (
                    <div className="ml-6">
                      <input
                        type="datetime-local"
                        value={campaignForm.schedule_time}
                        onChange={(e) => setCampaignForm({...campaignForm, schedule_time: e.target.value})}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={loading || !campaignForm.name || !campaignForm.template_id}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : campaignForm.send_immediately ? 'Create & Send' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              {confirmAction.type === 'send' ? 'Send Campaign' : 'Delete Campaign'}
            </h3>
            <p className="text-gray-700 mb-4">
              {confirmAction.type === 'send' 
                ? `Are you sure you want to send the campaign "${confirmAction.name}" now?`
                : `Are you sure you want to delete the campaign "${confirmAction.name}"?`
              }
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'send') {
                    handleSendCampaign(confirmAction.id);
                  } else {
                    // Handle delete campaign
                  }
                }}
                className={`px-4 py-2 text-white rounded-md ${
                  confirmAction.type === 'send' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {confirmAction.type === 'send' ? 'Send Now' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCampaigns; 