import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Psychologist } from '../types/psychologist';
import { Post } from '../types/post';

const PSYCHOLOGISTS_COLLECTION = 'psicologos';

export const subscribeToPsychologists = (
  callback: (psychologists: Psychologist[]) => void
) => {
  const q = query(
    collection(db, PSYCHOLOGISTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const psychologists: Psychologist[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.nombre || 'Especialista',
          imagen:
            data.imagen ||
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
          fotoPortada:
            data.fotoPortada ||
            'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
          especialidad: data.especialidad || 'Psicología y Acompañamiento',
          descripcion: data.descripcion || '',
          modalidad: data.modalidad || 'Presencial y En línea',
          temas: Array.isArray(data.temas) ? data.temas : [],
          correo: data.correo || '',
          telefono: data.telefono || data.whatsapp || '',
          whatsapp: data.whatsapp || data.telefono || '',
          sitioWeb: data.sitioWeb || '',
          ubicacion: data.ubicacion || '',
          verificado: data.verificado !== false,
          activo: data.activo !== false,
          createdAt: data.createdAt?.toMillis
            ? data.createdAt.toMillis()
            : Date.now(),
        };
      });

      callback(psychologists.filter((p) => p.activo !== false));
    },
    (error) => {
      console.error('Error listening to psychologists:', error);
      callback([]);
    }
  );
};

export const getPsychologists = async (): Promise<Psychologist[]> => {
  try {
    const q = query(
      collection(db, PSYCHOLOGISTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || 'Especialista',
        imagen:
          data.imagen ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        fotoPortada:
          data.fotoPortada ||
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
        especialidad: data.especialidad || 'Psicología y Acompañamiento',
        descripcion: data.descripcion || '',
        modalidad: data.modalidad || 'Presencial y En línea',
        temas: Array.isArray(data.temas) ? data.temas : [],
        correo: data.correo || '',
        telefono: data.telefono || data.whatsapp || '',
        whatsapp: data.whatsapp || data.telefono || '',
        sitioWeb: data.sitioWeb || '',
        ubicacion: data.ubicacion || '',
        verificado: data.verificado !== false,
        activo: data.activo !== false,
        createdAt: data.createdAt?.toMillis
          ? data.createdAt.toMillis()
          : Date.now(),
      };
    });
  } catch (error) {
    console.error('Error getting psychologists:', error);
    return [];
  }
};

/**
 * Fetches posts written by this psychologist or matching username
 */
export const getPsychologistPosts = async (
  psychologistName: string,
  psychologistId: string
): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('authorUsername', '==', psychologistName),
      limit(10)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          authorId: data.authorId || psychologistId,
          authorUsername: data.authorUsername || psychologistName,
          authorAvatarUrl: data.authorAvatarUrl || '',
          content: data.content || '',
          imageUrls: data.imageUrls || [],
          hashtags: data.hashtags || [],
          reactions: data.reactions || {
            teEscucho: 0,
            teAbrazo: 0,
            noEstasSolo: 0,
            fuerza: 0,
          },
          commentsCount: data.commentsCount || 0,
          savedBy: data.savedBy || [],
          createdAt: data.createdAt || 'Reciente',
          timestamp: data.timestamp || Date.now(),
        };
      });
    }

    return [];
  } catch (err) {
    console.warn('Error fetching psychologist posts:', err);
    return [];
  }
};
