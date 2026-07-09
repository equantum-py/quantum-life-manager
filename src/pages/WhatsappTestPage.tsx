import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { ProcessedMessageResult, whatsappIngestionService } from '../services/whatsappIngestionService';
import { mockIncomingMessages } from '../data/mockWhatsappMessages';

export function WhatsappTestPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [result, setResult] = useState<ProcessedMessageResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleClassify = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);
    setSaveMessage(null);
    setSaveError(null);
    
    try {
      const simulatedIncoming = {
        id: `msg_${Date.now()}`,
        from: '595981123456',
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        text: { body: text },
      };
      
      const res = await whatsappIngestionService.processMessage(simulatedIncoming);
      setResult(res);
      setSaveMessage('Clasificación guardada exitosamente en la base de datos.');
    } catch (e: any) {
      console.error(e);
      setSaveError(e.message || 'Error al procesar/guardar la clasificación.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadExample = (text: string) => {
    setInputMessage(text);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <div className="mb-2">
        <h2 className="text-[32px] font-black tracking-[-0.04em] text-slate-950">
          Simulador WhatsApp (Fase 1.5)
        </h2>
        <p className="mt-2 text-[16px] font-medium text-slate-500">
          Escribe un mensaje como si lo enviaras por WhatsApp para ver cómo la IA (simulada) lo clasifica y lo convierte en una entidad de Quantum Life Manager.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-slate-700">Mensaje a procesar</label>
          <Textarea 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ej: mañana recordar pagar la luz de casa"
            className="min-h-[100px]"
          />
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {mockIncomingMessages.map((m, i) => (
            <button
              key={m.id}
              onClick={() => loadExample(m.text!.body)}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
            >
              Ejemplo {i + 1}
            </button>
          ))}
        </div>

        <Button 
          onClick={() => handleClassify(inputMessage)}
          disabled={!inputMessage.trim() || isProcessing}
          className="min-h-[56px] w-full text-[16px]"
        >
          {isProcessing ? 'Clasificando...' : 'Clasificar Mensaje'}
        </Button>
      </div>

      {saveError && (
        <div className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600 shadow-sm">
          {saveError}
        </div>
      )}

      {saveMessage && !saveError && (
        <div className="rounded-2xl bg-green-50 p-4 font-semibold text-green-700 shadow-sm">
          {saveMessage}
        </div>
      )}

      {result && (
        <div className="space-y-4 rounded-[28px] border border-blue-200/50 bg-blue-50/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-bold text-slate-900">Resultado de Clasificación</h3>
            {result.status === 'ambiguous' ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Ambiguo</span>
            ) : (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">Listo para guardar</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-400">Sección detectada</p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {result.classification.section.sectionId || 'Ninguna'}
              </p>
              <p className="mt-1 text-xs text-slate-500">{result.classification.section.reasoning}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-400">Tipo detectado</p>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {result.classification.itemType.replace('_', ' ')}
              </p>
              <p className="mt-1 text-xs text-slate-500">Prioridad: {result.classification.extractedData.priority}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400">Título limpio</p>
            <p className="text-base font-medium text-slate-800">{result.classification.extractedData.title}</p>
          </div>
          
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400">Fecha detectada</p>
            <p className="text-base font-medium text-slate-800">{result.classification.extractedData.date || 'Sin fecha'}</p>
          </div>

          {result.status === 'ambiguous' && result.classification.suggestedClarificationQuestion && (
            <div className="rounded-2xl bg-red-50 p-4 shadow-sm border border-red-100">
              <p className="text-xs font-bold text-red-600">Pregunta de clarificación a enviar por WhatsApp:</p>
              <p className="text-sm font-medium text-red-800">{result.classification.suggestedClarificationQuestion}</p>
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-bold text-slate-400">JSON Output (Simulado de OpenAI/Gemini)</p>
            <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-4 text-xs text-green-400">
              {JSON.stringify(result.classification, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
