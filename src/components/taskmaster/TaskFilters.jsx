import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Filter, Search, Calendar, Flag, Hash } from 'lucide-react';

const TaskFilters = ({ filters, setFilters, stats }) => {
  const { isDark } = useTheme();

  const statusOptions = [
    { value: 'all', label: 'All Tasks', count: stats.total },
    { value: 'pending', label: 'To Do', count: stats.pending },
    { value: 'in_progress', label: 'In Progress', count: stats.inProgress },
    { value: 'completed', label: 'Completed', count: stats.completed }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Due Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const handleDateRangeChange = (value) => {
    if (value === 'all') {
      setFilters({ ...filters, dateRange: null });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start = new Date(today);
    let end = new Date(today);

    switch (value) {
      case 'today':
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        end.setDate(end.getDate() + 7);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'overdue':
        start = new Date(0); // From beginning of time
        end = new Date(today.getTime() - 1); // Yesterday
        break;
    }

    setFilters({ ...filters, dateRange: { start, end } });
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 space-y-6`}>
      <div className="flex items-center gap-2">
        <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Filters
        </h3>
      </div>

      {/* Search */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Search className="inline h-4 w-4 mr-1" />
          Search
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search tasks..."
          className={`w-full px-3 py-2 rounded-lg border ${
            isDark 
              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        />
      </div>

      {/* Status Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Hash className="inline h-4 w-4 mr-1" />
          Status
        </label>
        <div className="space-y-2">
          {statusOptions.map(option => (
            <label
              key={option.value}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={filters.status === option.value}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className={`ml-2 text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {option.label}
                </span>
              </div>
              {option.count !== undefined && (
                <span className={`text-sm ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {option.count}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Flag className="inline h-4 w-4 mr-1" />
          Priority
        </label>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className={`w-full px-3 py-2 rounded-lg border ${
            isDark 
              ? 'border-gray-600 bg-gray-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          {priorityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <Calendar className="inline h-4 w-4 mr-1" />
          Due Date
        </label>
        <select
          value={filters.dateRange ? 'custom' : 'all'}
          onChange={(e) => handleDateRangeChange(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border ${
            isDark 
              ? 'border-gray-600 bg-gray-700 text-white' 
              : 'border-gray-300 bg-white text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          {dateRangeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => setFilters({
          status: 'all',
          priority: 'all',
          search: '',
          dateRange: null
        })}
        className={`w-full px-3 py-2 text-sm font-medium rounded-lg ${
          isDark 
            ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
            : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
        } transition-colors`}
      >
        Clear Filters
      </button>
    </div>
  );
};

export default TaskFilters;