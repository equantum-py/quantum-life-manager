import { IncomingWhatsappMessage } from '../types/whatsapp';

export const mockIncomingMessages: IncomingWhatsappMessage[] = [
  {
    id: 'msg_1',
    from: '595981123456',
    timestamp: new Date().toISOString(),
    type: 'text',
    text: { body: 'mañana recordar pagar la luz de casa' }
  },
  {
    id: 'msg_2',
    from: '595981123456',
    timestamp: new Date().toISOString(),
    type: 'text',
    text: { body: 'eQuantum preparar propuesta para GuaraMarket el viernes' }
  },
  {
    id: 'msg_3',
    from: '595981123456',
    timestamp: new Date().toISOString(),
    type: 'text',
    text: { body: 'IDEAR entregar reseña de Piper el lunes' }
  },
  {
    id: 'msg_4',
    from: '595981123456',
    timestamp: new Date().toISOString(),
    type: 'text',
    text: { body: 'recordarme llamar mañana' }
  }
];
