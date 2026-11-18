import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { TopicArticle } from '../types/blog';
import { ReactionType } from '../types/post';

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
      const articles: TopicArticle[] = snapshot.docs.map((dSnap) => {
        const d = dSnap.data();
        return {
          id: dSnap.id,
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
          reactions: d.reactions || {
            teEscucho: 0,
            teAbrazo: 0,
            noEstasSolo: 0,
            fuerza: 0,
          },
          userReactions: d.userReactions || {},
          savedBy: Array.isArray(d.savedBy) ? d.savedBy : [],
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

/**
 * Reaccionar a un artículo del tema (Abrazo, Escucho, No estás solo, Fuerza)
 */
export async function toggleTopicArticleReaction(
  articleId: string,
  userId: string,
  newReaction: ReactionType
): Promise<void> {
  if (!db || !articleId || !userId) return;
  try {
    const artRef = doc(db, ARTICLES_COLLECTION, articleId);
    const snap = await getDoc(artRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const userReactions = { ...(data.userReactions || {}) };
    const currentReaction = userReactions[userId];
    const reactions = {
      teEscucho: 0,
      teAbrazo: 0,
      noEstasSolo: 0,
      fuerza: 0,
      ...(data.reactions || {}),
    };

    if (currentReaction === newReaction) {
      delete userReactions[userId];
      reactions[newReaction] = Math.max(0, (reactions[newReaction] || 1) - 1);
    } else {
      if (currentReaction && reactions[currentReaction] !== undefined) {
        reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 1) - 1);
      }
      userReactions[userId] = newReaction;
      reactions[newReaction] = (reactions[newReaction] || 0) + 1;
    }

    await updateDoc(artRef, {
      reactions,
      userReactions,
    });
  } catch (err) {
    console.error('Error al reaccionar a artículo:', err);
  }
}

/**
 * Guardar o desguardar un artículo del tema
 */
export async function toggleSaveTopicArticle(
  articleId: string,
  userId: string
): Promise<boolean> {
  if (!db || !articleId || !userId) return false;
  try {
    const artRef = doc(db, ARTICLES_COLLECTION, articleId);
    const snap = await getDoc(artRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const savedBy = [...(data.savedBy || [])];
    const index = savedBy.indexOf(userId);

    let isSaved = false;
    if (index > -1) {
      savedBy.splice(index, 1);
      isSaved = false;
    } else {
      savedBy.push(userId);
      isSaved = true;
    }

    await updateDoc(artRef, { savedBy });
    return isSaved;
  } catch (err) {
    console.error('Error al guardar artículo:', err);
    return false;
  }
}
