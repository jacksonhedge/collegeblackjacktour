import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';
import { taskMasterService } from '../services/firebase/TaskMasterService';

const TaskMasterContext = createContext({});

export const useTaskMaster = () => {
  const context = useContext(TaskMasterContext);
  if (!context) {
    throw new Error('useTaskMaster must be used within a TaskMasterProvider');
  }
  return context;
};

export const TaskMasterProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    dueToday: 0,
    highPriority: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    dateRange: null
  });

  // Load tasks when user changes
  useEffect(() => {
    if (currentUser) {
      loadTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [currentUser]);

  // Load tasks from Firebase
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userTasks = await taskMasterService.getUserTasks(currentUser.id);
      setTasks(userTasks);
      
      // Update stats
      const taskStats = await taskMasterService.getTaskStats(currentUser.id);
      setStats(taskStats);
    } catch (err) {
      // Only show error if it's not an index issue (handled in service)
      if (!err.message?.includes('index')) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const newTask = await taskMasterService.createTask(currentUser.id, taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
      // Update stats
      const taskStats = await taskMasterService.getTaskStats(currentUser.id);
      setStats(taskStats);
      
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw new Error('Failed to create task');
    }
  };

  // Update a task
  const updateTask = async (taskId, updates) => {
    try {
      const updatedTask = await taskMasterService.updateTask(taskId, updates);
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      
      // Update stats
      const taskStats = await taskMasterService.getTaskStats(currentUser.id);
      setStats(taskStats);
      
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error('Failed to update task');
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      await taskMasterService.deleteTask(taskId);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Update stats
      const taskStats = await taskMasterService.getTaskStats(currentUser.id);
      setStats(taskStats);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw new Error('Failed to delete task');
    }
  };

  // Toggle task completion
  const toggleTaskComplete = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  // Get filtered tasks
  const getFilteredTasks = () => {
    let filteredTasks = [...tasks];

    // Filter by status
    if (filters.status !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    // Filter by priority
    if (filters.priority !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filteredTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = task.dueDate.toDate();
        return dueDate >= start && dueDate <= end;
      });
    }

    return filteredTasks;
  };

  // Search tasks
  const searchTasks = async (searchTerm) => {
    try {
      if (!searchTerm) {
        await loadTasks();
        return;
      }

      const results = await taskMasterService.searchTasks(currentUser.id, searchTerm);
      setTasks(results);
    } catch (err) {
      console.error('Error searching tasks:', err);
      setError('Failed to search tasks');
    }
  };

  // Get tasks by status
  const getTasksByStatus = async (status) => {
    try {
      setLoading(true);
      const results = await taskMasterService.getTasksByStatus(currentUser.id, status);
      setTasks(results);
    } catch (err) {
      console.error('Error getting tasks by status:', err);
      setError('Failed to get tasks by status');
    } finally {
      setLoading(false);
    }
  };

  // Get tasks by due date
  const getTasksByDueDate = async (startDate, endDate) => {
    try {
      setLoading(true);
      const results = await taskMasterService.getTasksByDueDate(currentUser.id, startDate, endDate);
      setTasks(results);
    } catch (err) {
      console.error('Error getting tasks by due date:', err);
      setError('Failed to get tasks by due date');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks,
    loading,
    error,
    stats,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    getFilteredTasks,
    searchTasks,
    getTasksByStatus,
    getTasksByDueDate,
    loadTasks
  };

  return (
    <TaskMasterContext.Provider value={value}>
      {children}
    </TaskMasterContext.Provider>
  );
};

export default TaskMasterContext;