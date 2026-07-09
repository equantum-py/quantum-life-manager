import { dataModeService } from '../dataModeService';
import { supabase } from '../../lib/supabaseClient';
import { ProcessedMessageResult } from '../whatsappIngestionService';

export const whatsappRepository = {
  /**
   * Saves the log and classification to the database if in Supabase mode.
   * In mock mode, it does nothing and simply returns success.
   */
  async saveClassification(result: ProcessedMessageResult): Promise<void> {
    if (!dataModeService.isSupabaseMode()) {
      // In mock mode, we just pretend it was saved
      return;
    }

    if (!supabase) {
      throw new Error('Supabase no está configurado.');
    }

    const { raw, classification } = result;

    // 1. Insert into whatsapp_logs
    const { data: logData, error: logError } = await supabase
      .from('whatsapp_logs')
      .insert({
        message_sid: raw.id,
        body: raw.text?.body || '',
        sender_phone: raw.from,
        ai_raw_response: classification
      })
      .select('id')
      .single();

    if (logError || !logData) {
      throw new Error(`Error guardando whatsapp_log: ${logError?.message}`);
    }

    // 2. Insert into ai_classifications
    const { error: aiError } = await supabase
      .from('ai_classifications')
      .insert({
        whatsapp_log_id: logData.id,
        original_text: classification.originalText,
        item_type: classification.itemType,
        section_id: classification.section.sectionId,
        confidence: classification.section.confidence,
        reasoning: classification.section.reasoning,
        extracted_data: classification.extractedData,
        is_ambiguous: classification.isAmbiguous,
        suggested_clarification_question: classification.suggestedClarificationQuestion
      });

    if (aiError) {
      throw new Error(`Error guardando ai_classification: ${aiError.message}`);
    }
  }
};
