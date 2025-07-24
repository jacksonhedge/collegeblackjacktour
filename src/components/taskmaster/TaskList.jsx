import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleComplete, onEdit, onDelete, view = 'list' }) => {
  const { isDark } = useTheme();


  if (view === 'kanban') {
    const tasksByStatus = {
      pending: tasks.filter(t => t.status === 'pending'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      completed: tasks.filter(t => t.status === 'completed')
    };

    const columns = [
      { id: 'pending', title: 'To Do', color: 'gray' },
      { id: 'in_progress', title: 'In Progress', color: 'yellow' },
      { id: 'completed', title: 'Completed', color: 'green' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}
          >
            <h3 className={`text-sm font-medium mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {column.title}
              <span className={`ml-2 text-xs ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ({tasksByStatus[column.id].length})
              </span>
            </h3>
            <div className="space-y-2">
              {tasksByStatus[column.id].map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  compact
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default list view
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskList;