import { Section } from '../../types';
import { SectionRepository } from './types';
import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';

export const supabaseSectionRepository: SectionRepository = {
  async listSections(): Promise<Section[]> {
    dataModeService.assertSupabaseReady();
    const { data, error } = await supabase!.from('sections').select('*').order('name');
    if (error) throw error;
    
    return data as Section[];
  }
};
