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

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
  isAiGenerated?: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string; // Nuevo campo Lugar
  priority: Priority;
  status: Status;
  category: Category;
  createdAt: Date;
  creationDate: Date;
  updatedAt: Date;
  reporter: string;
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