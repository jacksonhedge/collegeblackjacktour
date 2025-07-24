import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase/client';
import { Plus, Edit, Trash2, Search, Filter, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { toast } from 'react-hot-toast';

const AIKnowledgeBaseManager = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    tags: '',
    relevance: 5
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'wallet', label: 'Wallet & Funds' },
    { value: 'groups', label: 'Groups' },
    { value: 'referrals', label: 'Referrals' },
    { value: 'rewards', label: 'Rewards' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'account', label: 'Account' },
    { value: 'payments', label: 'Payments' },
    { value: 'sports', label: 'Sports & Betting' }
  ];

  useEffect(() => {
    loadKnowledgeBase();
  }, []);

  const loadKnowledgeBase = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ai_knowledge_base')
        .select('*')
        .eq('is_active', true)
        .order('relevance', { ascending: false })
        .order('usage_count', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading knowledge base:', error);
      toast.error('Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const entryData = {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags: tagsArray,
        relevance: parseInt(formData.relevance)
      };

      if (editingEntry) {
        const { error } = await supabase
          .from('ai_knowledge_base')
          .update(entryData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('Entry updated successfully');
      } else {
        const { error } = await supabase
          .from('ai_knowledge_base')
          .insert(entryData);

        if (error) throw error;
        toast.success('Entry added successfully');
      }

      resetForm();
      loadKnowledgeBase();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('ai_knowledge_base')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      toast.success('Entry deleted');
      loadKnowledgeBase();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      question: entry.question,
      answer: entry.answer,
      category: entry.category,
      tags: entry.tags.join(', '),
      relevance: entry.relevance
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      tags: '',
      relevance: 5
    });
    setEditingEntry(null);
    setShowAddForm(false);
  };

  const filteredEntries = entries.filter(entry => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        entry.question.toLowerCase().includes(query) ||
        entry.answer.toLowerCase().includes(query) ||
        entry.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">AI Knowledge Base</h2>
          <p className="text-gray-400 mt-1">
            Manage Q&A entries to improve AI bot responses
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions, answers, or tags..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {editingEntry ? 'Edit Entry' : 'Add New Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Question</label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What question are users asking?"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="Provide a clear, helpful answer..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-400">Relevance (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.relevance}
                  onChange={(e) => setFormData({ ...formData, relevance: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Tags (comma-separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="wallet, deposit, bank transfer"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={resetForm}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingEntry ? 'Update' : 'Add'} Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-8">
              <p className="text-gray-400">No entries found</p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map(entry => (
            <Card key={entry.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-2">{entry.question}</h4>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{entry.answer}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-gray-500">
                            Category: <span className="text-purple-400">{entry.category}</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Used: <span className="text-green-400">{entry.usage_count} times</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            Relevance: <span className="text-yellow-400">{entry.relevance}/10</span>
                          </span>
                        </div>
                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEdit(entry)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(entry.id)}
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AIKnowledgeBaseManager;