import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { Psychologist } from '../types/psychologist';

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
          especialidad: data.especialidad || 'Psicología y Acompañamiento',
          correo: data.correo || '',
          telefono: data.telefono || '',
          ubicacion: data.ubicacion || '',
          descripcion: data.descripcion || '',
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
        especialidad: data.especialidad || 'Psicología y Acompañamiento',
        correo: data.correo || '',
        telefono: data.telefono || '',
        ubicacion: data.ubicacion || '',
        descripcion: data.descripcion || '',
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
