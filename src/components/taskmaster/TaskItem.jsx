import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar,
  Flag,
  Edit2,
  Trash2,
  MoreVertical,
  Tag
} from 'lucide-react';

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete, compact = false }) => {
  const { isDark } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    if (task.status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset time for comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate.getTime() === today.getTime()) {
      return { text: 'Today', color: 'text-blue-500' };
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return { text: 'Tomorrow', color: 'text-purple-500' };
    } else if (compareDate < today) {
      return { text: 'Overdue', color: 'text-red-500' };
    } else {
      return { 
        text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        color: isDark ? 'text-gray-400' : 'text-gray-600'
      };
    }
  };

  const dueDate = formatDueDate(task.dueDate);

  if (compact) {
    return (
      <div className={`p-3 rounded-lg ${
        isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
      } transition-colors cursor-pointer`}>
        <div className="flex items-start gap-2">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="mt-0.5 flex-shrink-0"
          >
            {getStatusIcon()}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${
              task.status === 'completed' 
                ? 'line-through text-gray-500' 
                : isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {task.title}
            </p>
            {dueDate && (
              <p className={`text-xs mt-1 ${dueDate.color}`}>
                {dueDate.text}
              </p>
            )}
          </div>
          <Flag className={`h-4 w-4 flex-shrink-0 ${getPriorityColor(task.priority)}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${
      isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
    } transition-colors`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task.id)}
          className="mt-1 flex-shrink-0"
        >
          {getStatusIcon()}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`text-base font-medium ${
                task.status === 'completed' 
                  ? 'line-through text-gray-500' 
                  : isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              {task.description && (
                <p className={`mt-1 text-sm ${
                  task.status === 'completed'
                    ? 'text-gray-400'
                    : isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg z-20 ${
                    isDark ? 'bg-gray-700' : 'bg-white'
                  } ring-1 ring-black ring-opacity-5`}>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onEdit(task);
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          isDark 
                            ? 'text-gray-300 hover:bg-gray-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        } flex items-center gap-2`}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          onDelete(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm">
            {dueDate && (
              <div className={`flex items-center gap-1 ${dueDate.color}`}>
                <Calendar className="h-4 w-4" />
                <span>{dueDate.text}</span>
              </div>
            )}
            
            <div className={`flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
              <Flag className="h-4 w-4" />
              <span className="capitalize">{task.priority}</span>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className="flex gap-1">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        isDark 
                          ? 'bg-gray-600 text-gray-300' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;