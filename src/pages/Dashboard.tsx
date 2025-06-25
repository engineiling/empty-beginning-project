
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Users, 
  Building2, 
  ListTodo, 
  CheckCircle2,
  Clock 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { companiesService } from '@/services/companies';
import { peopleService } from '@/services/people';
import { tasksService } from '@/services/tasks';
import { industriesService } from '@/services/industries';

const COLORS = ['#0EA5E9', '#8B5CF6', '#F97316', '#10B981', '#EF4444'];

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Get display name from profile or fallback to email
  const displayName = profile?.full_name || user?.email;

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesService.getAll,
  });

  const { data: people = [] } = useQuery({
    queryKey: ['people'],
    queryFn: peopleService.getAll,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksService.getAll,
    enabled: !!user,
  });

  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: industriesService.getAll,
  });

  // Calculate stats
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'Completed'
  ).length;

  // Calculate industry distribution
  const industryData = industries.map(industry => ({
    name: industry.name,
    value: companies.filter(company => company.industry === industry.name).length
  })).filter(item => item.value > 0);

  // Calculate task status distribution
  const taskStatusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'Open', value: tasks.filter(t => t.status === 'Open').length }
  ].filter(item => item.value > 0);

  // Get recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  // Get recent people (last 4)
  const recentPeople = people
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {displayName}</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-gray-600 text-sm">
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-crm-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Companies</p>
              <h3 className="text-2xl font-bold text-gray-900">{companies.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-purple-100 p-3">
              <Users className="h-6 w-6 text-crm-purple" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Contacts</p>
              <h3 className="text-2xl font-bold text-gray-900">{people.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-orange-100 p-3">
              <ListTodo className="h-6 w-6 text-crm-orange" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900">{tasks.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-crm-green" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900">{completedTasks}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Companies by Industry</CardTitle>
            <CardDescription>Distribution of companies by sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {industryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={industryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} companies`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Task Status Distribution</CardTitle>
            <CardDescription>Overview of task completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {taskStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskStatusData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0EA5E9" name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No tasks available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks and Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
            <CardDescription>Your recently created tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div 
                    key={task.id}
                    className="rounded-md border p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.company?.name || 'No company'}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === 'High' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </div>
                    </div>
                    {task.due_date && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tasks yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate('/tasks')}
                  >
                    Create your first task
                  </Button>
                </div>
              )}
            </div>
            {recentTasks.length > 0 && (
              <div className="mt-4 text-center">
                <button 
                  className="text-sm text-crm-blue hover:text-blue-700"
                  onClick={() => navigate('/tasks')}
                >
                  View all tasks →
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Recent Contacts</CardTitle>
            <CardDescription>Recently added people</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPeople.length > 0 ? (
                recentPeople.map((person) => (
                  <div 
                    key={person.id}
                    className="rounded-md border p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/people/${person.id}`)}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">{person.name}</h4>
                        <p className="text-sm text-gray-600">
                          {person.position || 'No position'} 
                          {person.company?.name && ` at ${person.company.name}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No contacts yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate('/people')}
                  >
                    Add your first contact
                  </Button>
                </div>
              )}
            </div>
            {recentPeople.length > 0 && (
              <div className="mt-4 text-center">
                <button 
                  className="text-sm text-crm-blue hover:text-blue-700"
                  onClick={() => navigate('/people')}
                >
                  View all contacts →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
