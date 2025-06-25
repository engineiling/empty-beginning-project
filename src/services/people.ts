
import { supabase } from "@/integrations/supabase/client";

export interface Person {
  id: string;
  name: string;
  position: string | null;
  company_id: string | null;
  email: string | null;
  phone: string | null;
  department: string | null;
  location: string | null;
  avatar_color: string;
  created_at: string;
  updated_at: string;
}

export interface PersonWithCompany extends Person {
  company?: {
    id: string;
    name: string;
  };
}

export const peopleService = {
  async getAll(): Promise<PersonWithCompany[]> {
    const { data, error } = await supabase
      .from('people' as any)
      .select(`
        *,
        company:companies(id, name)
      `)
      .order('name');
    
    if (error) throw error;
    return (data as PersonWithCompany[]) || [];
  },

  async getById(id: string): Promise<PersonWithCompany | null> {
    const { data, error } = await supabase
      .from('people' as any)
      .select(`
        *,
        company:companies(id, name)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as PersonWithCompany | null;
  },

  async create(person: Omit<Person, 'id' | 'created_at' | 'updated_at'>): Promise<Person> {
    const { data, error } = await supabase
      .from('people' as any)
      .insert([person])
      .select()
      .single();
    
    if (error) throw error;
    return data as Person;
  },

  async update(id: string, updates: Partial<Person>): Promise<Person> {
    const { data, error } = await supabase
      .from('people' as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Person;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('people' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
