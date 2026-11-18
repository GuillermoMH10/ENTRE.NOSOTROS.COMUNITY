import { ReactionType } from './post';

export interface TopicArticle {
  id: string;
  temaId: 'depresion' | 'ansiedad' | string;
  temaTitulo: string;
  titulo: string;
  resumen?: string;
  contenido: string;
  recomendaciones?: string;
  imagenUrl?: string;
  psicologoId: string;
  psicologoNombre: string;
  psicologoEspecialidad: string;
  psicologoCedula?: string;
  psicologoAvatar?: string;
  reactions?: {
    teEscucho: number;
    teAbrazo: number;
    noEstasSolo: number;
    fuerza: number;
  };
  userReactions?: Record<string, ReactionType>;
  savedBy?: string[];
  createdAt?: string;
  timestamp?: number;
}
