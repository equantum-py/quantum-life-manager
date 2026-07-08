export type Role='admin'|'collaborator'|'family';export type SectionId='familia'|'iglesia'|'inverfin'|'equantum'|'idear';
export interface User{id:string;name:string;email:string;password:string;role:Role;sections:SectionId[]}
export interface Section{id:SectionId;name:string;description:string;color:string;icon:string}
export type TaskStatus='Pendiente'|'En progreso'|'En revisión'|'Bloqueada'|'Terminada'|'Vencida';export type Priority='Baja'|'Media'|'Alta'|'Urgente';
export interface Task{id:string;title:string;description:string;sectionId:SectionId;projectId?:string;client?:string;priority:Priority;status:TaskStatus;dueDate:string;assignee:string;reminder?:string;createdAt:string;updatedAt:string}
export type MeetingType='Reunión'|'Entrega'|'Evento'|'Recordatorio'|'Actividad'|'Clase'|'Llamada';export interface Meeting{id:string;title:string;description:string;sectionId:SectionId;date:string;startTime:string;endTime:string;location?:string;type:MeetingType;reminder?:string;participants:string[];status:string}
export interface Note{id:string;title:string;content:string;sectionId:SectionId;category:string;links?:string[];createdAt:string;updatedAt:string}
export type ProjectStatus='Nuevo'|'En análisis'|'En diseño'|'En desarrollo'|'En revisión'|'Esperando cliente'|'Pausado'|'Terminado'|'Cobrado'|'Cancelado';export interface Project{id:string;name:string;client:string;status:ProjectStatus;priority:Priority;startDate:string;dueDate:string;pendingTasks:number;notes:string;links:{label:string;url:string}[];paymentStatus:string;sectionId:'equantum'}
export type AlertLevel='red'|'yellow'|'blue'|'green';export interface AppAlert{id:string;title:string;description:string;sectionId:SectionId;level:AlertLevel;date:string;action:string}
