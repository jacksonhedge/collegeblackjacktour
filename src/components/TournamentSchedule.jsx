import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SAMPLE_FRATERNITIES } from '../firebase/fraternityData';
import Select from 'react-select';

const TournamentSchedule = ({ tournaments }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1)); // February 1, 2025
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [collegeOptions, setCollegeOptions] = useState([]);
  const [fraternityOptions, setFraternityOptions] = useState([]);
  const [newEvent, setNewEvent] = useState({
    college: '',
    fraternity: '',
    googleForm: '',
    googleSheet: ''
  });

  useEffect(() => {
    const fetchCollegesAndFraternities = async () => {
      try {
        // Fetch colleges with ordering
        const collegesSnapshot = await getDocs(collection(db, 'colleges'));
        const collegesData = collegesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort colleges by name
        collegesData.sort((a, b) => a.name.localeCompare(b.name));
        
        setCollegeOptions(collegesData.map(college => ({
          value: college.name,
          label: (
            <div className="flex items-center gap-2">
              <img 
                src={college.logoUrl || '/default-college-logo.svg'} 
                alt={college.name}
                className="w-6 h-6 object-contain"
                onError={(e) => e.target.src = '/default-college-logo.svg'}
              />
              <div>
                <div>{college.name}</div>
                <div className="text-xs text-gray-500">{college.conference}</div>
              </div>
            </div>
          ),
          conference: college.conference
        })));

        // Common fraternities with their letters
        const commonFraternities = [
          { name: "Alpha Epsilon Pi", letters: "ΑΕΠ" },
          { name: "Alpha Tau Omega", letters: "ΑΤΩ" },
          { name: "Beta Theta Pi", letters: "ΒΘΠ" },
          { name: "Chi Phi", letters: "ΧΦ" },
          { name: "Chi Psi", letters: "ΧΨ" },
          { name: "Delta Chi", letters: "ΔΧ" },
          { name: "Delta Kappa Epsilon", letters: "ΔΚΕ" },
          { name: "Delta Sigma Phi", letters: "ΔΣΦ" },
          { name: "Delta Tau Delta", letters: "ΔΤΔ" },
          { name: "Delta Upsilon", letters: "ΔΥ" },
          { name: "Kappa Alpha Order", letters: "ΚΑ" },
          { name: "Kappa Delta Rho", letters: "ΚΔΡ" },
          { name: "Kappa Sigma", letters: "ΚΣ" },
          { name: "Lambda Chi Alpha", letters: "ΛΧΑ" },
          { name: "Phi Delta Theta", letters: "ΦΔΘ" },
          { name: "Phi Gamma Delta", letters: "ΦΓΔ" },
          { name: "Phi Kappa Psi", letters: "ΦΚΨ" },
          { name: "Phi Kappa Sigma", letters: "ΦΚΣ" },
          { name: "Phi Kappa Tau", letters: "ΦΚΤ" },
          { name: "Pi Kappa Alpha", letters: "ΠΚΑ" },
          { name: "Pi Kappa Phi", letters: "ΠΚΦ" },
          { name: "Sigma Alpha Epsilon", letters: "ΣΑΕ" },
          { name: "Sigma Alpha Mu", letters: "ΣΑΜ" },
          { name: "Sigma Chi", letters: "ΣΧ" },
          { name: "Sigma Nu", letters: "ΣΝ" },
          { name: "Sigma Phi Epsilon", letters: "ΣΦΕ" },
          { name: "Sigma Pi", letters: "ΣΠ" },
          { name: "Tau Kappa Epsilon", letters: "ΤΚΕ" },
          { name: "Theta Chi", letters: "ΘΧ" },
          { name: "Theta Xi", letters: "ΘΞ" },
          { name: "Zeta Beta Tau", letters: "ΖΒΤ" },
          { name: "Zeta Psi", letters: "ΖΨ" }
        ];
        
        // Create options with both name and letters
        const fraternityOpts = commonFraternities.map(frat => [
          { value: frat.name, label: `${frat.name} (${frat.letters})` },
          { value: frat.letters, label: `${frat.letters} - ${frat.name}` }
        ]).flat();

        // Sort options alphabetically
        fraternityOpts.sort((a, b) => a.label.localeCompare(b.label));

        setFraternityOptions(fraternityOpts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchCollegesAndFraternities();
  }, []);

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        ...newEvent,
        date: selectedDate,
        status: 'upcoming'
      };

      const tournamentsRef = collection(db, 'tournaments');
      await addDoc(tournamentsRef, eventData);

      // Reset form and close modal
      setNewEvent({
        college: '',
        fraternity: '',
        googleForm: '',
        googleSheet: ''
      });
      setShowEventModal(false);
      window.location.reload(); // Refresh to show new event
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  // Map of known dates to their days of week
  const knownDates = {
    '2025-02-06': 'Thursday',
    '2025-02-07': 'Friday',
    '2025-02-08': 'Saturday',
    '2025-02-09': 'Sunday',
    '2025-02-10': 'Monday',
    '2025-02-11': 'Tuesday',
    '2025-02-12': 'Wednesday',
    '2025-02-13': 'Thursday',
    '2025-02-14': 'Friday',
    '2025-02-15': 'Saturday',
    '2025-02-16': 'Sunday',
    '2025-02-17': 'Monday',
    '2025-02-18': 'Tuesday',
    '2025-02-19': 'Wednesday',
    '2025-02-20': 'Thursday',
    '2025-02-21': 'Friday',
    '2025-02-22': 'Saturday',
    '2025-02-23': 'Sunday',
    '2025-02-24': 'Monday',
    '2025-02-25': 'Tuesday',
    '2025-02-26': 'Wednesday',
    '2025-02-27': 'Thursday',
    '2025-02-28': 'Friday',
    '2025-03-01': 'Saturday',
    '2025-03-02': 'Sunday',
    '2025-03-03': 'Monday',
    '2025-03-04': 'Tuesday',
    '2025-03-05': 'Wednesday',
    '2025-03-06': 'Thursday',
    '2025-03-07': 'Friday',
    '2025-03-08': 'Saturday',
    '2025-03-09': 'Sunday',
    '2025-03-10': 'Monday',
    '2025-03-11': 'Tuesday',
    '2025-03-12': 'Wednesday',
    '2025-03-13': 'Thursday',
    '2025-03-14': 'Friday',
    '2025-03-15': 'Saturday',
    '2025-03-16': 'Sunday',
    '2025-03-17': 'Monday',
    '2025-03-18': 'Tuesday',
    '2025-03-19': 'Wednesday',
    '2025-03-20': 'Thursday',
    '2025-03-21': 'Friday',
    '2025-03-22': 'Saturday',
    '2025-03-23': 'Sunday',
    '2025-03-24': 'Monday',
    '2025-03-25': 'Tuesday',
    '2025-03-26': 'Wednesday',
    '2025-03-27': 'Thursday',
    '2025-03-28': 'Friday',
    '2025-03-29': 'Saturday',
    '2025-03-30': 'Sunday',
    '2025-03-31': 'Monday',
    '2025-04-01': 'Tuesday',
    '2025-04-02': 'Wednesday',
    '2025-04-03': 'Thursday',
    '2025-04-04': 'Friday',
    '2025-04-05': 'Saturday',
    '2025-04-06': 'Sunday',
    '2025-04-07': 'Monday',
    '2025-04-08': 'Tuesday',
    '2025-04-09': 'Wednesday',
    '2025-04-10': 'Thursday',
    '2025-04-11': 'Friday',
    '2025-04-12': 'Saturday',
    '2025-04-13': 'Sunday',
    '2025-04-14': 'Monday',
    '2025-04-15': 'Tuesday',
    '2025-04-16': 'Wednesday',
    '2025-04-17': 'Thursday',
    '2025-04-18': 'Friday',
    '2025-04-19': 'Saturday',
    '2025-04-20': 'Sunday',
    '2025-04-21': 'Monday',
    '2025-04-22': 'Tuesday',
    '2025-04-23': 'Wednesday',
    '2025-04-24': 'Thursday',
    '2025-04-25': 'Friday',
    '2025-04-26': 'Saturday',
    '2025-04-27': 'Sunday',
    '2025-04-28': 'Monday',
    '2025-04-29': 'Tuesday',
    '2025-04-30': 'Wednesday'
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get tournament events for a specific day
  const getTournamentsForDay = (day) => {
    const month = currentDate.getMonth() + 1;
    const dateString = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return tournaments.filter(tournament => {
      // Handle both date string formats (YYYY-MM-DD and timestamp)
      const tournamentDate = tournament.date instanceof Date ? tournament.date : new Date(tournament.date);
      const tournamentDateString = `${tournamentDate.getFullYear()}-${(tournamentDate.getMonth() + 1).toString().padStart(2, '0')}-${tournamentDate.getDate().toString().padStart(2, '0')}`;
      return tournamentDateString === dateString;
    });
  };

  // Get ordinal suffix for date
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Format date with day of week from known dates
  const formatDate = (day) => {
    const month = currentDate.getMonth() + 1;
    const dateKey = `2025-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const dayOfWeek = knownDates[dateKey] || '';
    const ordinalSuffix = getOrdinalSuffix(day);
    return `${dayOfWeek}, ${day}${ordinalSuffix}`;
  };

  // Navigation functions
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const grid = [];
    let day = 1;

    // Create weeks
    for (let i = 0; i < 6; i++) {
      const week = [];
      // Create days in each week
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          // Empty cells before first day
          week.push(null);
        } else if (day > daysInMonth) {
          // Empty cells after last day
          week.push(null);
        } else {
          week.push(day);
          day++;
        }
      }
      grid.push(week);
      if (day > daysInMonth) break;
    }

    return grid;
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const calendarGrid = generateCalendarGrid();

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: '42px',
      borderColor: '#D1D5DB',
      '&:hover': {
        borderColor: '#9CA3AF'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      padding: '8px 12px',
      backgroundColor: state.isFocused ? '#F3F4F6' : 'white',
      '&:hover': {
        backgroundColor: '#F3F4F6'
      }
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '4px 8px'
    })
  };

  return (
    <>
      <div className="bg-white shadow h-full">
        {/* Calendar Header */}
        <div className="bg-gray-800 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">{monthYear}</h3>
            <div className="flex space-x-2">
              <button 
                onClick={previousMonth}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 hover:bg-gray-700 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-2">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 text-sm py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dayTournaments = day ? getTournamentsForDay(day) : [];
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`}
                      className={`min-h-[100px] border p-2 ${
                        day ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium text-gray-600">
                              {formatDate(day)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(`2025-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                                setShowEventModal(true);
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              title="Add event"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-1">
                            {dayTournaments.map(tournament => (
                              <div
                                key={tournament.id}
                                className="text-xs p-2 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                title={`${tournament.college} - ${tournament.fraternity}\nForm: ${tournament.googleForm}\nSheet: ${tournament.googleSheet}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{tournament.college}</div>
                                    <div className="text-blue-600">{tournament.fraternity}</div>
                                  </div>
                                  <div className="text-blue-800">
                                    <a href={tournament.googleForm} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                      Form
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                New Event for {selectedDate}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College
                </label>
                <Select
                  options={collegeOptions}
                  value={collegeOptions.find(option => option.value === newEvent.college)}
                  onChange={(selected) => setNewEvent({ ...newEvent, college: selected?.value || '' })}
                  placeholder="Search for a college..."
                  isClearable
                  styles={customSelectStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fraternity
                </label>
                <Select
                  options={fraternityOptions}
                  value={fraternityOptions.find(option => option.value === newEvent.fraternity)}
                  onChange={(selected) => setNewEvent({ ...newEvent, fraternity: selected?.value || '' })}
                  placeholder="Search for a fraternity..."
                  isClearable
                  styles={customSelectStyles}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Form URL
                </label>
                <input
                  type="url"
                  value={newEvent.googleForm}
                  onChange={(e) => setNewEvent({ ...newEvent, googleForm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Google Form URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Sheet URL
                </label>
                <input
                  type="url"
                  value={newEvent.googleSheet}
                  onChange={(e) => setNewEvent({ ...newEvent, googleSheet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Google Sheet URL"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TournamentSchedule;
