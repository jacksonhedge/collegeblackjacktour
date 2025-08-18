import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { fraternityOptions } from '../data/fraternityListExpanded';

const EventCreationModal = ({ onClose, onSave, initialData = {} }) => {
  const [colleges, setColleges] = useState([]);
  const [showFraternityInput, setShowFraternityInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recentLogos, setRecentLogos] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    collegeName: '',
    collegeId: '',
    fraternityName: '',
    fraternityId: '',
    date: '',
    time: '',
    location: '',
    state: '', // Add state field
    registrationPassword: '',
    googleFormUrl: '',
    maxParticipants: 100,
    entryFee: 25,
    prizePool: 1000,
    salesContact: {
      name: '',
      email: '',
      phone: '',
      role: ''
    },
    showOnLandingPage: false,
    status: 'upcoming',
    backgroundImage: '',
    collegeLogo: '', // Add college logo field
    ...initialData
  });

  useEffect(() => {
    fetchColleges();
    // No longer need to fetch fraternities from database
    loadRecentLogos();
  }, []);

  const fetchColleges = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'colleges'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColleges(data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  // Removed fetchFraternities as we're using static list now

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleCollegeChange = (e) => {
    const collegeId = e.target.value;
    const college = colleges.find(c => c.id === collegeId);
    setFormData(prev => ({
      ...prev,
      collegeId,
      collegeName: college?.name || '',
      fraternityId: '',
      fraternityName: ''
    }));
  };

  const handleFraternityChange = (e) => {
    const fraternityValue = e.target.value;
    if (fraternityValue === 'custom') {
      setShowFraternityInput(true);
      setFormData(prev => ({
        ...prev,
        fraternityId: '',
        fraternityName: ''
      }));
    } else {
      const fraternity = fraternityOptions.find(f => f.value === fraternityValue);
      setShowFraternityInput(false);
      setFormData(prev => ({
        ...prev,
        fraternityId: fraternityValue,
        fraternityName: fraternity?.label || ''
      }));
    }
  };

  const loadRecentLogos = () => {
    // Load recent logos from localStorage
    const saved = localStorage.getItem('recentEventLogos');
    if (saved) {
      setRecentLogos(JSON.parse(saved));
    }
  };

  const saveRecentLogo = (url) => {
    const updated = [url, ...recentLogos.filter(u => u !== url)].slice(0, 10);
    setRecentLogos(updated);
    localStorage.setItem('recentEventLogos', JSON.stringify(updated));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `event-logos/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, backgroundImage: downloadURL }));
      saveRecentLogo(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCollegeLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `college-logos/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => ({ ...prev, collegeLogo: downloadURL }));
    } catch (error) {
      console.error('Error uploading college logo:', error);
      alert('Failed to upload college logo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const generatePassword = () => {
    const password = formData.fraternityName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    setFormData(prev => ({ ...prev, registrationPassword: password }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Auto-generate title if not provided
    const title = formData.title || 
      `${formData.collegeName} ${formData.fraternityName} Tournament ${formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear()}`;
    
    onSave({
      ...formData,
      title,
      date: formData.date ? new Date(formData.date) : null,
      backgroundImage: formData.backgroundImage || '/tournament-images/default.jpg',
      currentParticipants: 0,
      participants: []
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create New Event</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Event Title (Optional - will auto-generate)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Leave blank to auto-generate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  College
                </label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleCollegeChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select a college</option>
                  {colleges.map(college => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fraternity
                </label>
                {!showFraternityInput ? (
                  <select
                    name="fraternityId"
                    value={formData.fraternityId}
                    onChange={handleFraternityChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {fraternityOptions.map(fraternity => (
                      <option key={fraternity.value} value={fraternity.value}>
                        {fraternity.label}
                      </option>
                    ))}
                    <option value="custom">Other (Type Below)</option>
                  </select>
                ) : (
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="fraternityName"
                      value={formData.fraternityName}
                      onChange={handleChange}
                      placeholder="Enter fraternity name"
                      className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowFraternityInput(false);
                        setFormData(prev => ({ ...prev, fraternityId: '', fraternityName: '' }));
                      }}
                      className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Sigma Nu House, 123 College Ave"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State (2-Letter Code)
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g., MD, VA, PA"
                  maxLength="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 uppercase"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  College Logo
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCollegeLogoUpload}
                    className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.collegeLogo && (
                    <img src={formData.collegeLogo} alt="College Logo" className="h-10 w-10 object-contain rounded" />
                  )}
                  {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Registration Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Registration Password
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="registrationPassword"
                    value={formData.registrationPassword}
                    onChange={handleChange}
                    className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Google Form URL
                </label>
                <input
                  type="url"
                  name="googleFormUrl"
                  value={formData.googleFormUrl}
                  onChange={handleChange}
                  placeholder="https://forms.google.com/..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Max Participants
                </label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Entry Fee ($)
                </label>
                <input
                  type="number"
                  name="entryFee"
                  value={formData.entryFee}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prize Pool ($)
                </label>
                <input
                  type="number"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sales Contact */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Fraternity Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="salesContact.name"
                  value={formData.salesContact.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  name="salesContact.role"
                  value={formData.salesContact.role}
                  onChange={handleChange}
                  placeholder="e.g., Social Chair"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="salesContact.email"
                  value={formData.salesContact.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="salesContact.phone"
                  value={formData.salesContact.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Event Branding */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Event Branding</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Image (College Logo or Background)
                </label>
                <div className="mt-1">
                  {formData.backgroundImage && (
                    <div className="mb-4">
                      <img 
                        src={formData.backgroundImage} 
                        alt="Event background"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, backgroundImage: '' }))}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                  </div>
                  
                  {recentLogos.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 mb-2">Recent uploads:</p>
                      <div className="grid grid-cols-6 gap-2">
                        {recentLogos.map((logo, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, backgroundImage: logo }))}
                            className="relative group"
                          >
                            <img 
                              src={logo} 
                              alt={`Recent logo ${idx + 1}`}
                              className="w-full h-16 object-cover rounded-md border-2 border-transparent group-hover:border-blue-500 transition-colors"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Display Settings</h4>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="showOnLandingPage"
                  checked={formData.showOnLandingPage}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Show on landing page immediately
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreationModal;