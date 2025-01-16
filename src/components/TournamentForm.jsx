import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadTournamentImage } from '../firebase/storage';

const TournamentForm = ({ selectedTournament, selectedCollege, selectedFraternity, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: selectedTournament?.title || '',
    date: selectedTournament?.date || '',
    time: selectedTournament?.time || '',
    location: selectedTournament?.location || '',
    status: selectedTournament?.status || 'scheduled',
    type: selectedTournament?.type || 'blackjack',
    winner: selectedTournament?.winner || '',
    runnerUp: selectedTournament?.runnerUp || '',
    registrationDeadline: selectedTournament?.registrationDeadline || '',
    maxParticipants: selectedTournament?.maxParticipants || '',
    currentParticipants: selectedTournament?.currentParticipants || '0',
    entryFee: selectedTournament?.entryFee || '',
    imageUrl: selectedTournament?.imageUrl || '',
    // New fields for college and fraternity info
    collegeId: selectedTournament?.collegeId || '',
    collegeName: selectedTournament?.collegeName || '',
    fraternityId: selectedTournament?.fraternityId || '',
    fraternityName: selectedTournament?.fraternityName || '',
    chapterName: selectedTournament?.chapterName || ''
  });
  const [imageFile, setImageFile] = useState(null);

  // Set college and fraternity info when provided
  useEffect(() => {
    if (selectedCollege && selectedFraternity) {
      setFormData(prev => ({
        ...prev,
        collegeId: selectedCollege.id,
        collegeName: selectedCollege.name,
        fraternityId: selectedFraternity.id,
        fraternityName: selectedFraternity.name,
        chapterName: selectedFraternity.chapterName || '',
        location: selectedFraternity.chapterName ? `${selectedFraternity.chapterName} - ${selectedCollege.name}` : selectedCollege.name
      }));
    }
  }, [selectedCollege, selectedFraternity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        try {
          imageUrl = await uploadTournamentImage(imageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          imageUrl = '/tournament-images/default.jpg';
        }
      }

      const tournamentData = {
        ...formData,
        imageUrl: imageUrl || '/tournament-images/default.jpg',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      if (selectedTournament) {
        const tournamentRef = doc(db, 'tournaments', selectedTournament.id);
        await updateDoc(tournamentRef, tournamentData);
      } else {
        await addDoc(collection(db, 'tournaments'), tournamentData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving tournament:', error);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {selectedTournament ? 'Edit Tournament' : 'Add New Tournament'}
      </h2>
      
      {selectedCollege && selectedFraternity && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900">Creating Tournament For:</h3>
          <p className="text-blue-800">{selectedFraternity.name}</p>
          <p className="text-sm text-blue-600">
            {selectedFraternity.chapterName} - {selectedCollege.name}
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="blackjack">Blackjack</option>
              <option value="poker">Poker</option>
              <option value="dye">Dye</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Registration Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
            <input
              type="date"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Participants</label>
            <input
              type="number"
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Current Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Participants</label>
            <input
              type="number"
              name="currentParticipants"
              value={formData.currentParticipants}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Entry Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Entry Fee ($)</label>
            <input
              type="text"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Winner and Runner-up (only for completed tournaments) */}
          {formData.status === 'completed' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Winner</label>
                <input
                  type="text"
                  name="winner"
                  value={formData.winner}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Runner-up</label>
                <input
                  type="text"
                  name="runnerUp"
                  value={formData.runnerUp}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tournament Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : selectedTournament ? 'Update Tournament' : 'Add Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TournamentForm;
