import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { tasksService } from '@/services/tasks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const Tasks = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
  });

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll,
    enabled: !!user,
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filters.status === 'All' || task.status === filters.status;
    const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTasksByStatus = (status: string) => {
    if (status === 'all') return filteredTasks;
    if (status === 'overdue') {
      return filteredTasks.filter(task => 
        task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed'
      );
    }
    return filteredTasks.filter(task => 
      task.status.toLowerCase().replace(' ', '') === status.toLowerCase()
    );
  };

  if (tasksError) {
    toast.error('Failed to load tasks');
  }

  const TaskTable = ({ tasks }: { tasks: typeof filteredTasks }) => (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Title</th>
            <th scope="col" className="px-6 py-3">Due Date</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Priority</th>
            <th scope="col" className="px-6 py-3">Company</th>
            <th scope="col" className="px-6 py-3">Contact</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="bg-white border-b">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {task.title}
              </th>
              <td className="px-6 py-4">
                {task.due_date ? format(new Date(task.due_date), 'MM/dd/yyyy') : 'No due date'}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-800' :
                  task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4">{task.company?.name || '-'}</td>
              <td className="px-6 py-4">{task.person?.name || '-'}</td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                    <Trash className="h-4 w-4 mr-2" />Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Please log in to view your tasks.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track your tasks</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Task Management Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 w-full">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="open">Open ({getTasksByStatus('open').length})</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress ({getTasksByStatus('inprogress').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({getTasksByStatus('completed').length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({getTasksByStatus('overdue').length})</TabsTrigger>
        </TabsList>

        {/* All Tasks Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>All Tasks</CardTitle>
                <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                  <Input 
                    type="text" 
                    placeholder="Search tasks..." 
                    className="md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button><Search className="h-4 w-4 mr-2" />Search</Button>
                </div>
              </div>
              <CardDescription>Overview of all tasks in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 flex items-center space-x-4">
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {tasksLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-blue"></div>
                </div>
              ) : (
                <TaskTable tasks={getTasksByStatus('all')} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs */}
        {['open', 'inprogress', 'completed', 'overdue'].map(status => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('inprogress', 'In Progress')} Tasks
                </CardTitle>
                <CardDescription>
                  Tasks that are currently {status === 'inprogress' ? 'in progress' : status}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-blue"></div>
                  </div>
                ) : (
                  <TaskTable tasks={getTasksByStatus(status)} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Tasks;
