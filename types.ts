export enum Priority {
  BAJA = 'Baja',
  MEDIA = 'Media',
  ALTA = 'Alta',
  CRITICA = 'Crítica'
}

export enum Status {
  PENDIENTE = 'Pendiente',
  EN_PROCESO = 'En Proceso',
  FINALIZADA = 'Finalizada'
}

export enum Category {
  PARCELAS = 'Parcelas',
  BUNGALOWS = 'Bungalows',
  GLAMPING = 'Glamping',
  RESTAURANT = 'Restaurant',
  COCINA = 'Cocina',
  TTOO = 'TTOO',
  SANITARIOS = 'Sanitarios'
}

export enum Department {
  RECEPCION = 'Recepción',
  DIRECCION = 'Dirección',
  SSTT = 'Servicios Técnicos (SSTT)',
  RESTAURANTE = 'Restaurante',
  LIMPIEZA = 'Limpieza'
}

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  name: string;
  email: string;
  password?: string; // Nuevo campo para autenticación
  department: Department;
  role: UserRole;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  isAiGenerated?: boolean;
}

export interface StatusHistory {
  id: string;
  previousStatus: Status;
  newStatus: Status;
  changedBy: string;
  timestamp: Date;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string; // Nuevo campo Lugar
  priority: Priority;
  status: Status;
  statusHistory: StatusHistory[]; // Nuevo campo historial
  category: Category;
  createdAt: Date;
  creationDate: Date;
  updatedAt: Date;
  reporter: string;
  reporterDepartment?: Department;
  comments: Comment[];
  aiAnalysis?: {
    summary?: string;
    suggestedSteps?: string[];
  };
}

export interface AIAnalysisResult {
  priority: Priority;
  category: Category;
  titleSuggestion: string;
  suggestedSteps: string[];
}