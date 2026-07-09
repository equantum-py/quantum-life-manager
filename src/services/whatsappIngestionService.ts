import { IncomingWhatsappMessage, AiClassificationResult } from '../types/whatsapp';
import { mockClassifyMessage } from './aiClassificationMockService';
import { whatsappRepository } from './repositories/whatsappRepository';

export interface ProcessedMessageResult {
  raw: IncomingWhatsappMessage;
  classification: AiClassificationResult;
  status: 'ambiguous' | 'ready_to_save';
}

/**
 * Main service to process incoming messages (mock).
 * This simulates the Webhook receiving a message and passing it to the AI.
 */
export const whatsappIngestionService = {
  /**
   * Simulates processing a single text message.
   */
  async processMessage(message: IncomingWhatsappMessage): Promise<ProcessedMessageResult> {
    if (!message.text?.body) {
      throw new Error('Only text messages are supported in this mock.');
    }

    const classification = await mockClassifyMessage(message.text.body);

    const result: ProcessedMessageResult = {
      raw: message,
      classification,
      status: classification.isAmbiguous ? 'ambiguous' : 'ready_to_save'
    };

    // Save to the repository (Supabase if mode is active)
    await whatsappRepository.saveClassification(result);

    return result;
  }
};
