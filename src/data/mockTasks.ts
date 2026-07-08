import { Task } from '../types';
const today=new Date().toISOString().slice(0,10);const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);const week=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
export const mockTasks:Task[]=[
{id:'t1',title:'Revisar propuesta de GuaraMarket',description:'Validar alcance, costos y próximos pasos.',sectionId:'equantum',client:'GuaraMarket',priority:'Urgente',status:'Pendiente',dueDate:today,assignee:'Derlis',reminder:'Hoy 18:00',createdAt:today,updatedAt:today},
{id:'t2',title:'Preparar tarea de IDEAR',description:'Terminar avance del trabajo práctico.',sectionId:'idear',priority:'Alta',status:'En progreso',dueDate:week,assignee:'Derlis',createdAt:today,updatedAt:today},
{id:'t3',title:'Reunión de seguimiento eQuantum',description:'Armar agenda comercial semanal.',sectionId:'equantum',priority:'Media',status:'Pendiente',dueDate:today,assignee:'Daniel',createdAt:today,updatedAt:today},
{id:'t4',title:'Revisar pendientes de Inverfin',description:'Ordenar entregas y prioridades del día.',sectionId:'inverfin',priority:'Alta',status:'Vencida',dueDate:yesterday,assignee:'Derlis',createdAt:yesterday,updatedAt:today},
{id:'t5',title:'Organizar actividad de iglesia',description:'Confirmar materiales y participantes.',sectionId:'iglesia',priority:'Media',status:'Pendiente',dueDate:week,assignee:'Derlis',createdAt:today,updatedAt:today},
{id:'t6',title:'Recordatorio familiar',description:'Revisar pagos y compras del hogar.',sectionId:'familia',priority:'Baja',status:'Pendiente',dueDate:today,assignee:'Gabriela',createdAt:today,updatedAt:today}];
