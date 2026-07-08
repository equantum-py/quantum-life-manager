import { AiClassificationResult, LifeManagerItemType } from '../types/whatsapp';
import { SectionId } from '../types';
import { parseDateFromText } from '../utils/messageDateParser';

/**
 * Simulates an LLM classifying the message based on heuristics.
 */
export async function mockClassifyMessage(text: string): Promise<AiClassificationResult> {
  // Simulate network delay of an AI
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerText = text.toLowerCase();
  
  let sectionId: SectionId | null = null;
  let confidence = 0.5;
  let itemType: LifeManagerItemType = 'note';
  let title = text;
  let priority: 'Baja' | 'Media' | 'Alta' | 'Urgente' = 'Media';
  let clientOrProject = undefined;
  
  // 1. Detect Section
  if (lowerText.includes('casa') || lowerText.includes('familia') || lowerText.includes('luz')) {
    sectionId = 'familia';
    confidence = 0.9;
  } else if (lowerText.includes('equantum') || lowerText.includes('cliente') || lowerText.includes('propuesta')) {
    sectionId = 'equantum';
    confidence = 0.95;
    if (lowerText.includes('guaramarket')) {
      clientOrProject = 'GuaraMarket';
    }
  } else if (lowerText.includes('idear') || lowerText.includes('reseña') || lowerText.includes('entregar')) {
    sectionId = 'idear';
    confidence = 0.9;
  } else if (lowerText.includes('iglesia')) {
    sectionId = 'iglesia';
    confidence = 0.9;
  } else if (lowerText.includes('inverfin')) {
    sectionId = 'inverfin';
    confidence = 0.9;
  }

  // 2. Detect Type
  if (lowerText.includes('pagar') || lowerText.includes('pago')) {
    itemType = 'payment';
    priority = 'Alta';
  } else if (lowerText.includes('recordar')) {
    itemType = 'reminder';
  } else if (lowerText.includes('entregar') || lowerText.includes('reseña')) {
    itemType = 'academic_delivery';
    priority = 'Alta';
  } else if (lowerText.includes('reunión') || lowerText.includes('reunion') || lowerText.includes('juntarnos')) {
    itemType = 'meeting';
  } else if (lowerText.includes('preparar') || lowerText.includes('hacer') || lowerText.includes('llamar')) {
    itemType = 'task';
  }

  // 3. Clean Title
  const removeWords = ['mañana', 'el viernes', 'el lunes', 'recordar', 'equantum', 'idear'];
  let cleanTitle = text;
  removeWords.forEach(w => {
    const regex = new RegExp(`\\b${w}\\b`, 'gi');
    cleanTitle = cleanTitle.replace(regex, '');
  });
  cleanTitle = cleanTitle.trim().replace(/^./, str => str.toUpperCase());

  // 4. Check Ambiguity
  const isAmbiguous = sectionId === null || cleanTitle.length < 3;

  return {
    originalText: text,
    itemType,
    section: {
      sectionId,
      confidence,
      reasoning: sectionId ? `Palabras clave detectadas para la sección ${sectionId}` : 'Faltan detalles para clasificar.',
    },
    extractedData: {
      title: cleanTitle || text,
      date: parseDateFromText(text),
      priority,
      clientOrProject,
    },
    isAmbiguous,
    suggestedClarificationQuestion: isAmbiguous 
      ? 'No se pudo determinar sección. ¿Para qué área es esto? (familia, equantum, inverfin, iglesia, idear)' 
      : undefined
  };
}
