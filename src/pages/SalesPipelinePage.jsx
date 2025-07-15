import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const SalesPipelinePage = () => {
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGoogleSheetUrl();
  }, []);

  const fetchGoogleSheetUrl = async () => {
    try {
      const docRef = doc(db, 'settings', 'salesPipeline');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const url = docSnap.data().googleSheetUrl || '';
        setGoogleSheetUrl(url);
        setInputUrl(url);
      }
    } catch (error) {
      console.error('Error fetching Google Sheet URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'salesPipeline');
      await setDoc(docRef, {
        googleSheetUrl: inputUrl,
        updatedAt: new Date()
      });
      
      setGoogleSheetUrl(inputUrl);
      setIsEditing(false);
      alert('Google Sheet URL saved successfully!');
    } catch (error) {
      console.error('Error saving Google Sheet URL:', error);
      alert('Failed to save URL. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setInputUrl(googleSheetUrl);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
        <p className="text-gray-600">Manage your fraternity outreach and sales tracking</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Google Sheets Integration</h2>
          <p className="text-sm text-gray-600">
            Connect your Google Sheets document to track fraternity outreach, contact information, and sales progress.
          </p>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            {googleSheetUrl ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Google Sheet
                </label>
                <div className="flex items-center space-x-4">
                  <a
                    href={googleSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center px-4 py-3 border border-gray-300 rounded-md text-sm text-blue-600 hover:text-blue-800 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Google Sheet
                  </a>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Edit URL
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500 truncate">{googleSheetUrl}</p>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">No Google Sheet connected</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Google Sheet URL
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Sheet URL
              </label>
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Paste the full URL of your Google Sheets document
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !inputUrl}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save URL'}
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to set up your Sales Pipeline</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Create a new Google Sheet or use an existing one</li>
            <li>Set up columns for: Fraternity Name, Contact Person, Email, Phone, Status, Next Steps</li>
            <li>Make sure the sheet is shared (view access at minimum)</li>
            <li>Copy the full URL from your browser and paste it above</li>
            <li>Click "Save URL" to connect your sheet</li>
          </ol>
        </div>

        {/* Additional Features Coming Soon */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Pipeline Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Google Sheets integration</li>
                <li>• Manual tracking in spreadsheet</li>
                <li>• Easy access from admin panel</li>
              </ul>
            </div>
            <div className="border rounded-md p-4 opacity-60">
              <h4 className="font-medium text-gray-900 mb-2">Coming Soon</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automated lead tracking</li>
                <li>• Email integration</li>
                <li>• Conversion analytics</li>
                <li>• Automated follow-ups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPipelinePage;