import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Tag, 
  Link, 
  Users, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { enhancedReferralService } from '../../services/EnhancedReferralService';
import { format } from 'date-fns';

const AffiliateCodeManager = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCode, setEditingCode] = useState(null);
  const [showNewCodeForm, setShowNewCodeForm] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [codeStats, setCodeStats] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    code_type: 'affiliate',
    description: '',
    is_permanent: true,
    commission_rate: 10,
    fixed_bonus: 0,
    usage_limit: null,
    expires_at: ''
  });

  const [platformUrls, setPlatformUrls] = useState({});

  // Platform list for URL configuration
  const platforms = [
    { id: 'draftkings-sportsbook', name: 'DraftKings Sportsbook' },
    { id: 'fanduel-sportsbook', name: 'FanDuel Sportsbook' },
    { id: 'fanatics-sportsbook', name: 'Fanatics Sportsbook' },
    { id: 'betmgm-sportsbook', name: 'BetMGM Sportsbook' },
    { id: 'caesars-sportsbook', name: 'Caesars Sportsbook' },
    { id: 'espn-bet', name: 'ESPN BET' },
    { id: 'betrivers', name: 'BetRivers' },
    { id: 'draftkings-casino', name: 'DraftKings Casino' },
    { id: 'fanduel-casino', name: 'FanDuel Casino' },
    { id: 'prizepicks', name: 'PrizePicks' },
    { id: 'underdog', name: 'Underdog Fantasy' },
    { id: 'mcluck', name: 'McLuck' },
    { id: 'pulsz', name: 'Pulsz' },
    { id: 'sportsmillions', name: 'Sports Millions' },
    { id: 'realprize', name: 'RealPrize' }
  ];

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an admin-only endpoint
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCodes(data || []);
      
      // Load stats for each code
      const statsPromises = (data || []).map(code => 
        enhancedReferralService.getCodeUsageStats(code.id)
      );
      const stats = await Promise.all(statsPromises);
      const statsMap = {};
      (data || []).forEach((code, index) => {
        statsMap[code.id] = stats[index];
      });
      setCodeStats(statsMap);
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCode = async () => {
    try {
      // Check if code is available
      const isAvailable = await enhancedReferralService.isCodeAvailable(formData.code);
      if (!isAvailable) {
        alert('This code is already taken. Please choose another.');
        return;
      }

      // Create the code
      const newCode = await enhancedReferralService.createReferralCode({
        ...formData,
        expires_at: formData.expires_at || undefined
      });

      if (newCode) {
        // Update platform URLs if any
        if (Object.keys(platformUrls).length > 0) {
          const urlsArray = Object.entries(platformUrls)
            .filter(([_, url]) => url)
            .map(([platform_id, url]) => ({
              platform_id,
              platform_name: platforms.find(p => p.id === platform_id)?.name || platform_id,
              url
            }));
          
          await enhancedReferralService.updateAffiliatePlatformUrls(newCode.id, urlsArray);
        }

        // Reload codes
        await loadCodes();
        setShowNewCodeForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating code:', error);
      alert('Failed to create code. Please try again.');
    }
  };

  const handleUpdateCode = async (codeId) => {
    try {
      // Update code details
      const { error } = await supabase
        .from('referral_codes')
        .update({
          description: editingCode.description,
          is_active: editingCode.is_active,
          commission_rate: editingCode.commission_rate,
          fixed_bonus: editingCode.fixed_bonus,
          usage_limit: editingCode.usage_limit,
          expires_at: editingCode.expires_at || null
        })
        .eq('id', codeId);

      if (error) throw error;

      // Update platform URLs
      if (editingCode.platformUrls) {
        const urlsArray = Object.entries(editingCode.platformUrls)
          .filter(([_, url]) => url)
          .map(([platform_id, url]) => ({
            platform_id,
            platform_name: platforms.find(p => p.id === platform_id)?.name || platform_id,
            url
          }));
        
        await enhancedReferralService.updateAffiliatePlatformUrls(codeId, urlsArray);
      }

      await loadCodes();
      setEditingCode(null);
    } catch (error) {
      console.error('Error updating code:', error);
      alert('Failed to update code. Please try again.');
    }
  };

  const handleDeleteCode = async (codeId) => {
    if (!confirm('Are you sure you want to delete this code? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('referral_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;
      await loadCodes();
    } catch (error) {
      console.error('Error deleting code:', error);
      alert('Failed to delete code. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      code_type: 'affiliate',
      description: '',
      is_permanent: true,
      commission_rate: 10,
      fixed_bonus: 0,
      usage_limit: null,
      expires_at: ''
    });
    setPlatformUrls({});
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast notification
  };

  const getCodeTypeColor = (type) => {
    switch (type) {
      case 'affiliate': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'promotional': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Referral Code Management</h2>
          <p className="text-gray-400 text-sm mt-1">
            Manage affiliate, user, and promotional codes
          </p>
        </div>
        <Button
          onClick={() => setShowNewCodeForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Code
        </Button>
      </div>

      {/* New Code Form */}
      {showNewCodeForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Code</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Code
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="AFFILIATE2024"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.code_type}
                  onChange={(e) => setFormData({...formData, code_type: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border-gray-600 text-white rounded-md"
                >
                  <option value="affiliate">Affiliate</option>
                  <option value="user">User</option>
                  <option value="promotional">Promotional</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Special partner code for..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Commission Rate (%)
                </label>
                <Input
                  type="number"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value)})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Fixed Bonus ($)
                </label>
                <Input
                  type="number"
                  value={formData.fixed_bonus}
                  onChange={(e) => setFormData({...formData, fixed_bonus: parseFloat(e.target.value)})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Usage Limit
                </label>
                <Input
                  type="number"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData({...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="Unlimited"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Expires At
                </label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="col-span-2">
                <label className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.is_permanent}
                    onChange={(e) => setFormData({...formData, is_permanent: e.target.checked})}
                    className="rounded bg-gray-700 border-gray-600"
                  />
                  <span>Permanent code (stays with user forever)</span>
                </label>
              </div>
            </div>
            
            {/* Platform URLs Configuration */}
            {formData.code_type === 'affiliate' && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-white mb-3">Custom Platform URLs</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {platforms.map(platform => (
                    <div key={platform.id} className="flex items-center space-x-2">
                      <label className="text-sm text-gray-300 w-48">{platform.name}:</label>
                      <Input
                        value={platformUrls[platform.id] || ''}
                        onChange={(e) => setPlatformUrls({...platformUrls, [platform.id]: e.target.value})}
                        placeholder="Custom affiliate URL"
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowNewCodeForm(false);
                  resetForm();
                }}
                className="text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Codes List */}
      <div className="grid gap-4">
        {codes.map((code) => (
          <Card key={code.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              {editingCode?.id === code.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description
                      </label>
                      <Input
                        value={editingCode.description}
                        onChange={(e) => setEditingCode({...editingCode, description: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Status
                      </label>
                      <select
                        value={editingCode.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setEditingCode({...editingCode, is_active: e.target.value === 'active'})}
                        className="w-full px-3 py-2 bg-gray-700 border-gray-600 text-white rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Commission Rate (%)
                      </label>
                      <Input
                        type="number"
                        value={editingCode.commission_rate}
                        onChange={(e) => setEditingCode({...editingCode, commission_rate: parseFloat(e.target.value)})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Fixed Bonus ($)
                      </label>
                      <Input
                        type="number"
                        value={editingCode.fixed_bonus}
                        onChange={(e) => setEditingCode({...editingCode, fixed_bonus: parseFloat(e.target.value)})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setEditingCode(null)}
                      className="text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleUpdateCode(code.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">{code.code}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCodeTypeColor(code.code_type)}`}>
                          {code.code_type}
                        </span>
                        {code.is_permanent && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Permanent
                          </span>
                        )}
                        {!code.is_active && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{code.description}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(enhancedReferralService.generateReferralLink(code.code))}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCode(code)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCode(code.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center text-gray-400 text-xs mb-1">
                        <Users className="w-3 h-3 mr-1" />
                        Total Users
                      </div>
                      <div className="text-white font-semibold">
                        {codeStats[code.id]?.total_users || 0}
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center text-gray-400 text-xs mb-1">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Total Earnings
                      </div>
                      <div className="text-white font-semibold">
                        ${codeStats[code.id]?.total_earnings?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center text-gray-400 text-xs mb-1">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Commission
                      </div>
                      <div className="text-white font-semibold">
                        {code.commission_rate}%
                      </div>
                    </div>
                    
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center text-gray-400 text-xs mb-1">
                        <Tag className="w-3 h-3 mr-1" />
                        Fixed Bonus
                      </div>
                      <div className="text-white font-semibold">
                        ${code.fixed_bonus}
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div>
                      Created: {format(new Date(code.created_at), 'MMM d, yyyy')}
                    </div>
                    <div>
                      {code.usage_limit && (
                        <span className="mr-4">
                          Usage: {code.usage_count}/{code.usage_limit}
                        </span>
                      )}
                      {code.expires_at && (
                        <span>
                          Expires: {format(new Date(code.expires_at), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Show referral link */}
                  <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">Referral Link:</div>
                      <a
                        href={enhancedReferralService.generateReferralLink(code.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                      >
                        {enhancedReferralService.generateReferralLink(code.code)}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {codes.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No referral codes yet. Create your first code to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Import supabase after to avoid circular dependency
import { supabase } from '../../services/supabase/config';

export default AffiliateCodeManager;