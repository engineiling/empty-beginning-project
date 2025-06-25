
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  company_id: string | null;
  person_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  company?: {
    id: string;
    name: string;
  };
  person?: {
    id: string;
    name: string;
  };
}

export const tasksService = {
  async getAll(): Promise<TaskWithRelations[]> {
    const { data, error } = await supabase
      .from('tasks' as any)
      .select(`
        *,
        company:companies(id, name),
        person:people(id, name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data as TaskWithRelations[]) || [];
  },

  async getById(id: string): Promise<TaskWithRelations | null> {
    const { data, error } = await supabase
      .from('tasks' as any)
      .select(`
        *,
        company:companies(id, name),
        person:people(id, name)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as TaskWithRelations | null;
  },

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks' as any)
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data as Task;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks' as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Task;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
