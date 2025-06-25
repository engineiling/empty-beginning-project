
import { supabase } from "@/integrations/supabase/client";

export interface Company {
  id: string;
  name: string;
  industry: string;
  description: string | null;
  employees: number | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  logo_color: string;
  created_at: string;
  updated_at: string;
}

export const companiesService = {
  async getAll(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies' as any)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies' as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies' as any)
      .insert([company])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies' as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
