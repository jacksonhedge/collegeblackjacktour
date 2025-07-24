import React, { useState, useEffect } from 'react';
import { useTaskMaster } from '../contexts/TaskMasterContext';
import { useTheme } from '../contexts/ThemeContext';
import TaskList from '../components/taskmaster/TaskList';
import TaskForm from '../components/taskmaster/TaskForm';
import TaskStats from '../components/taskmaster/TaskStats';
import TaskFilters from '../components/taskmaster/TaskFilters';
import { Plus, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const TaskMaster = () => {
  const { 
    tasks, 
    loading, 
    error, 
    stats, 
    filters, 
    setFilters, 
    getFilteredTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete
  } = useTaskMaster();
  
  const { isDark } = useTheme();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState('list'); // list, calendar, kanban
  
  const filteredTasks = getFilteredTasks();

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const getQuickStats = () => {
    return [
      {
        label: 'Due Today',
        value: stats.dueToday,
        icon: Calendar,
        color: 'text-blue-500',
        bgColor: isDark ? 'bg-blue-500/10' : 'bg-blue-100'
      },
      {
        label: 'In Progress',
        value: stats.inProgress,
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: isDark ? 'bg-yellow-500/10' : 'bg-yellow-100'
      },
      {
        label: 'Completed',
        value: stats.completed,
        icon: CheckCircle2,
        color: 'text-green-500',
        bgColor: isDark ? 'bg-green-500/10' : 'bg-green-100'
      },
      {
        label: 'Overdue',
        value: stats.overdue,
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: isDark ? 'bg-red-500/10' : 'bg-red-100'
      }
    ];
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-purple-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Task Master
                </h1>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Manage your tasks and stay productive
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setShowTaskForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getQuickStats().map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-lg p-4 ${
                  isDark ? 'border border-gray-700' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color} opacity-50`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <TaskFilters 
              filters={filters} 
              setFilters={setFilters}
              stats={stats}
            />
          </div>

          {/* Task List */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {filteredTasks.length === 0 ? (
              <div className={`text-center py-12 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } rounded-lg shadow`}>
                <AlertCircle className={`mx-auto h-12 w-12 ${
                  isDark ? 'text-gray-400' : 'text-gray-300'
                }`} />
                <h3 className={`mt-2 text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-900'
                }`}>
                  No tasks found
                </h3>
                <p className={`mt-1 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {filters.status !== 'all' || filters.priority !== 'all' || filters.search
                    ? 'Try adjusting your filters'
                    : 'Get started by creating a new task'}
                </p>
                {tasks.length === 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create your first task
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onToggleComplete={toggleTaskComplete}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                view={view}
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask.id, data) : 
            handleCreateTask
          }
          onClose={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TaskMaster;