import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AdminTeamPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const teamRef = collection(db, 'team');
      const snapshot = await getDocs(teamRef);
      const membersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await updateDoc(doc(db, 'team', editingMember.id), formData);
      } else {
        await addDoc(collection(db, 'team'), {
          ...formData,
          createdAt: new Date()
        });
      }
      setFormData({ name: '', role: '', email: '', phone: '' });
      setShowAddForm(false);
      setEditingMember(null);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteDoc(doc(db, 'team', memberId));
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
      }
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone
    });
    setShowAddForm(true);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-600 mt-2">Manage your team members and their roles</p>
      </div>

      {/* Add/Edit Form */}
      {showAddForm ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                {editingMember ? 'Update' : 'Add'} Team Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingMember(null);
                  setFormData({ name: '', role: '', email: '', phone: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mb-8 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Add Team Member
        </button>
      )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
            <p className="text-gray-600 mt-1">{member.role}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {member.email}
              </p>
              {member.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {member.phone}
                </p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(member)}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <p className="text-gray-500">No team members yet. Add your first team member!</p>
        </div>
      )}
    </div>
  );
};

export default AdminTeamPage;