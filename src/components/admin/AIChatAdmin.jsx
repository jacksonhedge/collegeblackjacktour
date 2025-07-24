import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  MessageSquare,
  BookOpen,
  BarChart,
  Settings,
  Save,
  X
} from 'lucide-react';
import { supabase } from '../../services/supabase/client';

const AIChatAdmin = () => {
  const [activeTab, setActiveTab] = useState('knowledge');
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'knowledge') {
        await fetchKnowledgeBase();
      } else if (activeTab === 'conversations') {
        await fetchConversations();
      } else if (activeTab === 'analytics') {
        await fetchStats();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledgeBase = async () => {
    const { data, error } = await supabase
      .from('ai_knowledge_base')
      .select('*')
      .order('category', { ascending: true })
      .order('usage_count', { ascending: false });

    if (!error) {
      setKnowledgeBase(data || []);
    }
  };

  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from('ai_chat_conversations')
      .select(`
        *,
        ai_chat_messages(count)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error) {
      setConversations(data || []);
    }
  };

  const fetchStats = async () => {
    // Get conversation stats
    const { data: convData } = await supabase
      .from('ai_chat_conversations')
      .select('status');

    // Get message count
    const { count: messageCount } = await supabase
      .from('ai_chat_messages')
      .select('*', { count: 'exact', head: true });

    // Get average rating
    const { data: ratingData } = await supabase
      .from('ai_chat_feedback')
      .select('rating')
      .not('rating', 'is', null);

    const avgRating = ratingData && ratingData.length > 0
      ? ratingData.reduce((sum, item) => sum + item.rating, 0) / ratingData.length
      : 0;

    setStats({
      totalConversations: convData?.length || 0,
      activeConversations: convData?.filter(c => c.status === 'active').length || 0,
      totalMessages: messageCount || 0,
      avgRating: avgRating.toFixed(1)
    });
  };

  const handleSaveKnowledge = async (item) => {
    try {
      if (item.id) {
        // Update existing
        const { error } = await supabase
          .from('ai_knowledge_base')
          .update({
            category: item.category,
            question: item.question,
            answer: item.answer,
            keywords: item.keywords,
            is_active: item.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('ai_knowledge_base')
          .insert({
            category: item.category,
            question: item.question,
            answer: item.answer,
            keywords: item.keywords,
            is_active: true
          });

        if (error) throw error;
      }

      setEditingItem(null);
      fetchKnowledgeBase();
    } catch (error) {
      console.error('Error saving knowledge base item:', error);
      alert('Failed to save item');
    }
  };

  const handleDeleteKnowledge = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('ai_knowledge_base')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchKnowledgeBase();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const filteredKnowledge = knowledgeBase.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold">AI Chat Management</h1>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Claude AI
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'knowledge'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Knowledge Base
            </button>
            <button
              onClick={() => setActiveTab('conversations')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'conversations'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Conversations
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
            </div>
          ) : (
            <>
              {/* Knowledge Base Tab */}
              {activeTab === 'knowledge' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search knowledge base..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingItem({ category: '', question: '', answer: '', keywords: [] })}
                      className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Entry
                    </button>
                  </div>

                  {editingItem && (
                    <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingItem.id ? 'Edit Entry' : 'New Entry'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={editingItem.category}
                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select category</option>
                            <option value="wallet">Wallet</option>
                            <option value="groups">Groups</option>
                            <option value="rewards">Rewards</option>
                            <option value="referral">Referral</option>
                            <option value="account">Account</option>
                            <option value="technical">Technical</option>
                            <option value="general">General</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={editingItem.question}
                            onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="What question does this answer?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Answer
                          </label>
                          <textarea
                            value={editingItem.answer}
                            onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            rows={4}
                            placeholder="Provide a clear, helpful answer..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Keywords (comma separated)
                          </label>
                          <input
                            type="text"
                            value={editingItem.keywords?.join(', ') || ''}
                            onChange={(e) => setEditingItem({ 
                              ...editingItem, 
                              keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                            })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="keyword1, keyword2, keyword3"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveKnowledge(editingItem)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {filteredKnowledge.map((item) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                {item.category}
                              </span>
                              <span className="text-xs text-gray-500">
                                Used {item.usage_count} times
                              </span>
                              {!item.is_active && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{item.question}</h3>
                            <p className="text-gray-600 text-sm mb-2">{item.answer}</p>
                            {item.keywords && item.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.keywords.map((keyword, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-2 text-gray-500 hover:text-purple-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteKnowledge(item.id)}
                              className="p-2 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversations Tab */}
              {activeTab === 'conversations' && (
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            conv.status === 'active' ? 'bg-green-100 text-green-700' :
                            conv.status === 'escalated' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {conv.status}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(conv.created_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {conv.ai_chat_messages?.[0]?.count || 0} messages
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        User ID: {conv.user_id || 'Anonymous'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">Total Conversations</h3>
                    <p className="text-3xl font-bold text-purple-900">{stats.totalConversations}</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-green-700 mb-2">Active Conversations</h3>
                    <p className="text-3xl font-bold text-green-900">{stats.activeConversations}</p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-700 mb-2">Total Messages</h3>
                    <p className="text-3xl font-bold text-blue-900">{stats.totalMessages}</p>
                  </div>
                  <div className="bg-yellow-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-700 mb-2">Average Rating</h3>
                    <p className="text-3xl font-bold text-yellow-900">{stats.avgRating}/5.0</p>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold mb-4">Claude API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <input
                        type="password"
                        placeholder="sk-ant-api..."
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        defaultValue={import.meta.env.VITE_CLAUDE_API_KEY || ''}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set the REACT_APP_CLAUDE_API_KEY environment variable to enable Claude AI
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model
                      </label>
                      <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="claude-3-sonnet-20240229">Claude 3 Sonnet (Recommended)</option>
                        <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                        <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                      </select>
                    </div>
                    <div className="pt-4">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatAdmin;