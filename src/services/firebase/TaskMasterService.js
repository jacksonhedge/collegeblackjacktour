import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

class TaskMasterService {
  constructor() {
    this.collectionName = 'tasks';
  }

  // Create a new task
  async createTask(userId, taskData) {
    try {
      const newTask = {
        ...taskData,
        userId,
        status: taskData.status || 'pending',
        priority: taskData.priority || 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        completedAt: null,
        reminders: taskData.reminders || [],
        tags: taskData.tags || [],
        attachments: taskData.attachments || []
      };

      const docRef = await addDoc(collection(db, this.collectionName), newTask);
      return { id: docRef.id, ...newTask };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Get all tasks for a user
  async getUserTasks(userId) {
    try {
      // Try the optimized query first
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return tasks;
    } catch (error) {
      // If index error, try without ordering
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn('Index not available, fetching without ordering. Please create the index using the link in the console.');
        try {
          const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId)
          );

          const querySnapshot = await getDocs(q);
          const tasks = [];
          
          querySnapshot.forEach((doc) => {
            tasks.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // Sort manually
          tasks.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
            const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
            return dateB - dateA;
          });

          return tasks;
        } catch (fallbackError) {
          console.error('Error fetching tasks (fallback):', fallbackError);
          return [];
        }
      }
      
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Get tasks by status
  async getTasksByStatus(userId, status) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('status', '==', status),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return tasks;
    } catch (error) {
      // If index error, try without ordering
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.warn('Index not available for status query, fetching without ordering.');
        try {
          const q = query(
            collection(db, this.collectionName),
            where('userId', '==', userId),
            where('status', '==', status)
          );

          const querySnapshot = await getDocs(q);
          const tasks = [];
          
          querySnapshot.forEach((doc) => {
            tasks.push({
              id: doc.id,
              ...doc.data()
            });
          });

          // Sort manually
          tasks.sort((a, b) => {
            // First by priority
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by createdAt
            const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
            const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
            return dateB - dateA;
          });

          return tasks;
        } catch (fallbackError) {
          console.error('Error fetching tasks by status (fallback):', fallbackError);
          return [];
        }
      }
      
      console.error('Error fetching tasks by status:', error);
      return [];
    }
  }

  // Get tasks by due date
  async getTasksByDueDate(userId, startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('dueDate', '>=', Timestamp.fromDate(startDate)),
        where('dueDate', '<=', Timestamp.fromDate(endDate)),
        orderBy('dueDate', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks by due date:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(taskId, updates) {
    try {
      const taskRef = doc(db, this.collectionName, taskId);
      
      // If marking as completed, add completedAt timestamp
      if (updates.status === 'completed' && !updates.completedAt) {
        updates.completedAt = serverTimestamp();
      }
      
      // If reopening task, clear completedAt
      if (updates.status === 'pending' || updates.status === 'in_progress') {
        updates.completedAt = null;
      }

      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      return { id: taskId, ...updates };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      await deleteDoc(doc(db, this.collectionName, taskId));
      return taskId;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Get task statistics
  async getTaskStats(userId) {
    try {
      const tasks = await this.getUserTasks(userId);
      
      const stats = {
        total: tasks.length,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        dueToday: 0,
        highPriority: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      tasks.forEach(task => {
        // Status counts
        if (task.status === 'pending') stats.pending++;
        else if (task.status === 'in_progress') stats.inProgress++;
        else if (task.status === 'completed') stats.completed++;

        // Priority counts
        if (task.priority === 'high') stats.highPriority++;

        // Due date checks
        if (task.dueDate) {
          const dueDate = task.dueDate.toDate();
          if (dueDate < today && task.status !== 'completed') {
            stats.overdue++;
          } else if (dueDate >= today && dueDate < tomorrow) {
            stats.dueToday++;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting task stats:', error);
      throw error;
    }
  }

  // Search tasks
  async searchTasks(userId, searchTerm) {
    try {
      const allTasks = await this.getUserTasks(userId);
      
      const searchTermLower = searchTerm.toLowerCase();
      return allTasks.filter(task => 
        task.title.toLowerCase().includes(searchTermLower) ||
        task.description?.toLowerCase().includes(searchTermLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    } catch (error) {
      console.error('Error searching tasks:', error);
      throw error;
    }
  }

  // Get recurring tasks
  async getRecurringTasks(userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('isRecurring', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return tasks;
    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      throw error;
    }
  }
}

export const taskMasterService = new TaskMasterService();