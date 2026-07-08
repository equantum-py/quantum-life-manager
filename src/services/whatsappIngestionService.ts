import { IncomingWhatsappMessage, AiClassificationResult } from '../types/whatsapp';
import { mockClassifyMessage } from './aiClassificationMockService';

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

    return {
      raw: message,
      classification,
      status: classification.isAmbiguous ? 'ambiguous' : 'ready_to_save'
    };
  }
};
