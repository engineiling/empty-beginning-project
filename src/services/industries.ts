
import { supabase } from "@/integrations/supabase/client";

export interface Industry {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export const industriesService = {
  async getAll(): Promise<Industry[]> {
    const { data, error } = await supabase
      .from('industries' as any)
      .select('*')
      .order('name');
    
    if (error) throw error;
    return (data as Industry[]) || [];
  },

  async getById(id: string): Promise<Industry | null> {
    const { data, error } = await supabase
      .from('industries' as any)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as Industry | null;
  },

  async create(industry: Omit<Industry, 'id' | 'created_at' | 'updated_at'>): Promise<Industry> {
    const { data, error } = await supabase
      .from('industries' as any)
      .insert([industry])
      .select()
      .single();
    
    if (error) throw error;
    return data as Industry;
  },

  async update(id: string, updates: Partial<Industry>): Promise<Industry> {
    const { data, error } = await supabase
      .from('industries' as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Industry;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('industries' as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
