
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus, Search, Mail, Phone, Building2 } from 'lucide-react';
import { peopleService } from '@/services/people';
import { companiesService } from '@/services/companies';
import { toast } from "sonner";

const departmentsList = [
  'All Departments',
  'Executive',
  'Technology',
  'Sales',
  'Marketing',
  'Finance',
  'Operations',
  'Research',
  'Human Resources',
];

const People = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All Companies');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');

  const { data: people = [], isLoading: peopleLoading, error: peopleError } = useQuery({
    queryKey: ['people'],
    queryFn: peopleService.getAll,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companiesService.getAll,
  });

  const companiesList = ['All Companies', ...companies.map(c => c.name)];

  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (person.position && person.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (person.company?.name && person.company.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCompany = companyFilter === 'All Companies' || person.company?.name === companyFilter;
    const matchesDepartment = departmentFilter === 'All Departments' || person.department === departmentFilter;
    return matchesSearch && matchesCompany && matchesDepartment;
  });

  const handlePersonClick = (id: string) => {
    navigate(`/people/${id}`);
  };

  const getAvatarBackground = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'purple': return 'bg-purple-500';
      case 'orange': return 'bg-orange-500';
      case 'red': return 'bg-red-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  if (peopleError) {
    toast.error('Failed to load people');
  }

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-gray-600">Manage your contacts</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            className="bg-crm-blue hover:bg-blue-600"
            onClick={() => navigate('/people/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Person
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search people..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <Select 
            value={companyFilter} 
            onValueChange={setCompanyFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by company" />
            </SelectTrigger>
            <SelectContent>
              {companiesList.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-48">
          <Select 
            value={departmentFilter} 
            onValueChange={setDepartmentFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              {departmentsList.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* People List */}
      {peopleLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crm-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <Card 
              key={person.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handlePersonClick(person.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full ${getAvatarBackground(person.avatar_color)} text-white flex items-center justify-center font-medium text-lg`}>
                    {getInitials(person.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{person.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{person.position || 'No position'}</p>
                    <p className="text-sm text-gray-600 truncate">{person.company?.name || 'No company'}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  {person.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={`mailto:${person.email}`} 
                        className="text-blue-600 hover:text-blue-800 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {person.email}
                      </a>
                    </div>
                  )}
                  {person.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <a 
                        href={`tel:${person.phone}`} 
                        className="text-gray-900"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {person.phone}
                      </a>
                    </div>
                  )}
                  {(person.department || person.location) && (
                    <div className="flex items-center text-sm">
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600 truncate">
                        {person.department && person.location ? `${person.department} • ${person.location}` : 
                         person.department || person.location}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPeople.length === 0 && !peopleLoading && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No people found</h3>
              <p className="text-gray-600 mt-1">Try adjusting your search or add a new person.</p>
              <Button 
                onClick={() => navigate('/people/new')}
                variant="outline" 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Person
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default People;
