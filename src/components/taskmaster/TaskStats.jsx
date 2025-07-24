import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const TaskStats = ({ stats }) => {
  const { isDark } = useTheme();

  const calculateProductivity = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const productivity = calculateProductivity();

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Productivity Overview
        </h3>
        <TrendingUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>

      {/* Productivity Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Completion Rate
          </span>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {productivity}%
          </span>
        </div>
        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              productivity >= 80 ? 'bg-green-500' :
              productivity >= 60 ? 'bg-yellow-500' :
              productivity >= 40 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${productivity}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Tasks
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">
              {stats.completed}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Completed
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.inProgress}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              In Progress
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {stats.overdue}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Overdue
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Focus Areas
        </h4>
        <div className="space-y-2">
          {stats.overdue > 0 && (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              isDark ? 'bg-red-900/20' : 'bg-red-50'
            }`}>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className={`text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''} need attention
              </span>
            </div>
          )}
          {stats.dueToday > 0 && (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              isDark ? 'bg-blue-900/20' : 'bg-blue-50'
            }`}>
              <Clock className="h-4 w-4 text-blue-500" />
              <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                {stats.dueToday} task{stats.dueToday !== 1 ? 's' : ''} due today
              </span>
            </div>
          )}
          {stats.highPriority > 0 && (
            <div className={`flex items-center gap-2 p-2 rounded-lg ${
              isDark ? 'bg-purple-900/20' : 'bg-purple-50'
            }`}>
              <AlertCircle className="h-4 w-4 text-purple-500" />
              <span className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                {stats.highPriority} high priority task{stats.highPriority !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskStats;