import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { TopicArticle } from '../types/blog';

const ARTICLES_COLLECTION = 'articulos_temas';

/**
 * Suscribe a los artículos publicados por psicólogos sobre un tema específico (ej: 'depresion' o 'ansiedad')
 */
export const subscribeToTopicArticles = (
  topicId: string,
  callback: (articles: TopicArticle[]) => void
) => {
  if (!db || !topicId) {
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, ARTICLES_COLLECTION),
    where('temaId', '==', topicId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const articles: TopicArticle[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          temaId: d.temaId || topicId,
          temaTitulo: d.temaTitulo || (topicId === 'depresion' ? 'Depresión' : 'Ansiedad'),
          titulo: d.titulo || 'Sin título',
          resumen: d.resumen || '',
          contenido: d.contenido || '',
          recomendaciones: d.recomendaciones || '',
          imagenUrl: d.imagenUrl || '',
          psicologoId: d.psicologoId || '',
          psicologoNombre: d.psicologoNombre || 'Especialista Clínico',
          psicologoEspecialidad: d.psicologoEspecialidad || 'Psicología y Acompañamiento',
          psicologoCedula: d.psicologoCedula || '',
          psicologoAvatar: d.psicologoAvatar || '',
          createdAt: d.createdAt || '',
          timestamp: typeof d.timestamp === 'number' ? d.timestamp : Date.now(),
        };
      });

      // Ordenar por más recientes primero
      articles.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      callback(articles);
    },
    (err) => {
      console.warn('Error al escuchar artículos del tema:', err);
      callback([]);
    }
  );
};
