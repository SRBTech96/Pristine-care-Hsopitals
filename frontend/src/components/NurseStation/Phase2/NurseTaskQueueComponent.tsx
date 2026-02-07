// frontend/src/components/NurseStation/Phase2/NurseTaskQueueComponent.tsx
import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
} from 'lucide-react';

interface NurseTask {
  id?: string;
  wardId: string;
  taskType:
    | 'vitals'
    | 'medication'
    | 'wound_care'
    | 'hygiene'
    | 'mobilization'
    | 'feeding'
    | 'other';
  assignedTo: string;
  patientId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  dueTime: Date;
  description: string;
  createdAt?: Date;
  completedAt?: Date;
}

export const NurseTaskQueueComponent: React.FC<{
  wardId: string;
  currentNurseId: string;
  tasks?: NurseTask[];
  onTaskCreate?: (task: NurseTask) => void;
  onTaskUpdate?: (task: NurseTask) => void;
}> = ({ wardId, currentNurseId, tasks: initialTasks = [], onTaskCreate, onTaskUpdate }) => {
  const [tasks, setTasks] = useState<NurseTask[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'completed'>(
    'all'
  );
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<NurseTask>>({
    priority: 'medium',
    status: 'assigned',
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vitals: 'Vital Signs',
      medication: 'Medication',
      wound_care: 'Wound Care',
      hygiene: 'Hygiene',
      mobilization: 'Mobilization',
      feeding: 'Feeding',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const isOverdue = (dueTime: Date) => new Date() > new Date(dueTime);
  const isToday = (dueTime: Date) => {
    const due = new Date(dueTime);
    const today = new Date();
    return (
      due.getDate() === today.getDate() &&
      due.getMonth() === today.getMonth() &&
      due.getFullYear() === today.getFullYear()
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'overdue') return isOverdue(task.dueTime);
    if (filter === 'today') return isToday(task.dueTime);
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  // Sort by: overdue first, then by priority, then by dueTime
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aOverdue = a.status === 'overdue' ? 1 : 0;
    const bOverdue = b.status === 'overdue' ? 1 : 0;
    if (aOverdue !== bOverdue) return bOverdue - aOverdue;

    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }

    return new Date(a.dueTime).getTime() - new Date(b.dueTime).getTime();
  });

  const overdueTasks = sortedTasks.filter((t) => isOverdue(t.dueTime));
  const assignedTasks = sortedTasks.filter(
    (t) => t.status !== 'completed' && !isOverdue(t.dueTime)
  );
  const completedTasks = sortedTasks.filter((t) => t.status === 'completed');

  const handleCreateTask = () => {
    if (
      !newTask.description?.trim() ||
      !newTask.dueTime ||
      !newTask.taskType
    ) {
      alert('Please fill all required fields');
      return;
    }

    const task: NurseTask = {
      wardId,
      taskType: newTask.taskType as any,
      assignedTo: newTask.assignedTo || currentNurseId,
      patientId: newTask.patientId,
      priority: newTask.priority as any,
      status: newTask.status as any,
      dueTime: newTask.dueTime,
      description: newTask.description,
      createdAt: new Date(),
    };

    setTasks([...tasks, task]);
    onTaskCreate?.(task);
    setNewTask({ priority: 'medium', status: 'assigned' });
    setShowNewTask(false);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            status: newStatus as any,
            completedAt: newStatus === 'completed' ? new Date() : undefined,
          }
        : t
    );
    setTasks(updated);
    onTaskUpdate?.(updated.find((t) => t.id === taskId)!);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-800">Task Queue</h2>
          {overdueTasks.length > 0 && (
            <span className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded-full font-bold animate-pulse">
              {overdueTasks.length} OVERDUE
            </span>
          )}
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        {(['all', 'overdue', 'today', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium transition border-b-2 ${
              filter === f
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${sortedTasks.length})`}
            {f === 'overdue' && ` (${overdueTasks.length})`}
            {f === 'today' && ` (${assignedTasks.filter(t => isToday(t.dueTime)).length})`}
            {f === 'completed' && ` (${completedTasks.length})`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tasks</p>
          </div>
        ) : (
          <>
            {overdueTasks.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  OVERDUE TASKS ({overdueTasks.length})
                </h3>
                <div className="space-y-2 bg-red-50 p-4 rounded-lg border border-red-200">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-4 rounded border border-red-300"
                    >
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() =>
                          setExpandedTask(
                            expandedTask === task.id ? null : task.id
                          )
                        }
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(task.status)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {getTaskTypeLabel(task.taskType)}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description}
                            </p>
                            {task.patientId && (
                              <p className="text-xs text-gray-500 mt-1">
                                Patient: {task.patientId}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority.toUpperCase()}
                              </span>
                              <span className="text-xs text-red-600 font-bold">
                                Due:{' '}
                                {new Date(task.dueTime).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition ${
                            expandedTask === task.id ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {expandedTask === task.id && (
                        <div className="border-t mt-3 pt-3">
                          <div className="flex gap-2">
                            {task.status !== 'completed' && (
                              <button
                                onClick={() =>
                                  handleUpdateTaskStatus(
                                    task.id!,
                                    'completed'
                                  )
                                }
                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition font-medium"
                              >
                                Mark Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id!)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sortedTasks
              .filter((t) => !overdueTasks.includes(t))
              .map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded border-l-4 ${
                    task.status === 'completed'
                      ? 'bg-gray-50 border-gray-300'
                      : getPriorityColor(task.priority).split(' ')[0] +
                        ' border-opacity-30'
                  }`}
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedTask(expandedTask === task.id ? null : task.id)
                    }
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold ${
                            task.status === 'completed'
                              ? 'line-through text-gray-500'
                              : 'text-gray-800'
                          }`}
                        >
                          {getTaskTypeLabel(task.taskType)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {task.description}
                        </p>
                        {task.patientId && (
                          <p className="text-xs text-gray-500 mt-1">
                            Patient: {task.patientId}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            Due:{' '}
                            {new Date(task.dueTime).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition ${
                        expandedTask === task.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedTask === task.id && (
                    <div className="border-t mt-3 pt-3">
                      <div className="flex gap-2">
                        {task.status !== 'completed' && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateTaskStatus(
                                  task.id!,
                                  task.status === 'in_progress'
                                    ? 'assigned'
                                    : 'in_progress'
                                )
                              }
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition font-medium"
                            >
                              {task.status === 'in_progress'
                                ? 'Mark Pending'
                                : 'Start Task'}
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateTaskStatus(
                                  task.id!,
                                  'completed'
                                )
                              }
                              className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition font-medium"
                            >
                              Complete
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteTask(task.id!)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </>
        )}
      </div>

      {showNewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Create New Task</h3>
              <button
                onClick={() => setShowNewTask(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Type
                </label>
                <select
                  value={newTask.taskType || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, taskType: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select task type</option>
                  <option value="vitals">Vital Signs</option>
                  <option value="medication">Medication</option>
                  <option value="wound_care">Wound Care</option>
                  <option value="hygiene">Hygiene</option>
                  <option value="mobilization">Mobilization</option>
                  <option value="feeding">Feeding</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID (Optional)
                </label>
                <input
                  type="text"
                  value={newTask.patientId || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, patientId: e.target.value })
                  }
                  placeholder="e.g., P001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description || ''}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Describe the task..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newTask.priority || ''}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Time
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      newTask.dueTime
                        ? new Date(newTask.dueTime)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        dueTime: new Date(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleCreateTask}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Create Task
                </button>
                <button
                  onClick={() => setShowNewTask(false)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
