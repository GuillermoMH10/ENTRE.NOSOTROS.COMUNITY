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
  createdAt?: string;
  timestamp?: number;
}
