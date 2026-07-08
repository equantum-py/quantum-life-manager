import { Section } from '../../types';
import { SectionRepository } from './types';
import { mockSections } from '../../data/mockSections';

// Sections are generally static in this mock context, no localStorage needed
export const mockSectionRepository: SectionRepository = {
  async listSections(): Promise<Section[]> {
    return [...mockSections];
  }
};
