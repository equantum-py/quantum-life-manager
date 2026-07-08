import { SectionId } from './index';

/**
 * Meta WhatsApp Cloud API Incoming Message Payload (Simplified)
 */
export interface IncomingWhatsappMessage {
  id: string;
  from: string; // Phone number
  timestamp: string;
  type: 'text' | 'audio' | 'image' | 'document';
  text?: {
    body: string;
  };
  // Future fields for audio, etc.
}

/**
 * Valid item types that the AI can detect
 */
export type LifeManagerItemType =
  | 'task'
  | 'reminder'
  | 'note'
  | 'meeting'
  | 'event'
  | 'payment'
  | 'academic_delivery'
  | 'project'
  | 'idea';

/**
 * Result of the AI attempting to classify the area/section
 */
export interface SectionDetectionResult {
  sectionId: SectionId | null; // null if ambiguous
  confidence: number; // 0.0 to 1.0
  reasoning: string; // Why the AI picked this section
}

/**
 * Structured output returned by the LLM
 */
export interface AiClassificationResult {
  originalText: string;
  itemType: LifeManagerItemType;
  section: SectionDetectionResult;
  
  // Extracted entities depending on the type
  extractedData: {
    title: string;
    description?: string;
    date?: string; // ISO format or relative (if resolved)
    startTime?: string;
    endTime?: string;
    priority?: 'Baja' | 'Media' | 'Alta' | 'Urgente';
    clientOrProject?: string; // e.g., 'GuaraMarket'
    amount?: number; // for payments
  };
  
  isAmbiguous: boolean; // True if confidence is low or missing mandatory data
  suggestedClarificationQuestion?: string; // What to ask the user if ambiguous
}
