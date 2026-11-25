import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadMediaToStorage } from './postsService';
import { Post } from '../types/post';
import { StandActivity } from '../data/standDynamicActivities';

const GUEST_SESSION_ID_KEY = '@entre_nosotros_guest_session_id';
const GUEST_STAND_POSTS_KEY = '@entre_nosotros_guest_stand_posts';
const GUEST_NAME_KEY = '@entre_nosotros_guest_name';

/**
 * Obtiene o crea un ID único de sesión para el usuario invitado en el dispositivo
 */
export async function getOrCreateGuestSessionId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(GUEST_SESSION_ID_KEY);
    if (existing) return existing;
    const newId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    await AsyncStorage.setItem(GUEST_SESSION_ID_KEY, newId);
    return newId;
  } catch {
    return 'guest_' + Date.now();
  }
}

/**
 * Obtiene el último nombre usado por el invitado en el dispositivo
 */
export async function getStoredGuestName(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(GUEST_NAME_KEY)) || '';
  } catch {
    return '';
  }
}

/**
 * Guarda localmente el post creado por el invitado
 */
export async function saveLocalGuestStandPost(postId: string, guestName: string): Promise<void> {
  try {
    await AsyncStorage.setItem(GUEST_NAME_KEY, guestName);
    const raw = await AsyncStorage.getItem(GUEST_STAND_POSTS_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(postId)) {
      list.push(postId);
      await AsyncStorage.setItem(GUEST_STAND_POSTS_KEY, JSON.stringify(list));
    }
  } catch (e) {
    console.warn('[standDynamicService] Error guardando post localmente:', e);
  }
}

/**
 * Obtiene la lista de IDs de posts creados localmente como invitado
 */
export async function getLocalGuestStandPosts(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_STAND_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface SubmitStandDynamicParams {
  guestName: string;
  activity: StandActivity;
  content: string;
  mediaSource?: string | null;
  userId?: string | null;
  userUsername?: string | null;
  userAvatarUrl?: string | null;
}

/**
 * Publica la actividad del stand en Firestore y la guarda localmente en el dispositivo
 */
export async function submitStandDynamicPost({
  guestName,
  activity,
  content,
  mediaSource,
  userId,
  userUsername,
  userAvatarUrl,
}: SubmitStandDynamicParams): Promise<{ success: boolean; postId: string; error?: string }> {
  try {
    const sessionId = await getOrCreateGuestSessionId();
    const postId = 'post_stand_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = Date.now();
    const createdAt = new Date().toISOString();

    const cleanName = (userUsername || guestName || 'Participante del Stand').trim();

    // Subir imagen a Firebase Storage si fue capturada o seleccionada
    const uploadedMediaUrls: string[] = [];
    if (mediaSource) {
      try {
        const storagePath = `posts/${postId}/stand_${Date.now()}.jpg`;
        const publicUrl = await uploadMediaToStorage(mediaSource, storagePath);
        if (publicUrl) {
          uploadedMediaUrls.push(publicUrl);
        }
      } catch (errUpload) {
        console.warn('[standDynamicService] Advertencia al subir imagen:', errUpload);
      }
    }

    // Avatar amigable de respaldo
    const fallbackAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(cleanName)}`;
    const finalAvatar = userAvatarUrl || fallbackAvatar;
    const finalAuthorId = userId || sessionId;

    const newPost: Post = {
      id: postId,
      authorId: finalAuthorId,
      authorUsername: cleanName,
      authorAvatarUrl: finalAvatar,
      content: content.trim(),
      imageUrls: uploadedMediaUrls,
      hashtags: ['#DinámicaStand', '#EntreNosotros', '#ConoceEntreNosotros'],
      isStandDynamic: true,
      dynamicActivityTitle: activity.title,
      guestSessionId: sessionId,
      guestName: cleanName,
      reactions: {
        teEscucho: 0,
        teAbrazo: 0,
        noEstasSolo: 0,
        fuerza: 0,
      },
      userReactions: {},
      commentsCount: 0,
      savedBy: [],
      createdAt,
      timestamp,
    };

    // Guardar en Firestore colección `posts` para que aparezca en el feed
    await setDoc(doc(db, 'posts', postId), newPost);

    // Guardar en el almacenamiento local del dispositivo del usuario
    await saveLocalGuestStandPost(postId, cleanName);

    return { success: true, postId };
  } catch (error: any) {
    console.error('[standDynamicService] Error al publicar actividad del stand:', error);
    return {
      success: false,
      postId: '',
      error: error?.message || 'No se pudo publicar tu actividad.',
    };
  }
}

/**
 * Reclama las publicaciones hechas como invitado cuando el usuario se registra o inicia sesión
 */
export async function claimGuestStandPosts(
  userId: string,
  username: string,
  avatarUrl?: string
): Promise<{ claimedCount: number }> {
  try {
    const localPostIds = await getLocalGuestStandPosts();
    if (localPostIds.length === 0) {
      return { claimedCount: 0 };
    }

    let claimedCount = 0;
    const updates = localPostIds.map(async (postId) => {
      try {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          authorId: userId,
          authorUsername: username,
          ...(avatarUrl ? { authorAvatarUrl: avatarUrl } : {}),
        });
        claimedCount++;
      } catch (errDoc) {
        console.warn(`[standDynamicService] No se pudo reclamar post ${postId}:`, errDoc);
      }
    });

    await Promise.all(updates);

    // Limpiar posts reclamados de local storage
    await AsyncStorage.removeItem(GUEST_STAND_POSTS_KEY);

    console.log(`[standDynamicService] Se vincularon ${claimedCount} publicaciones del stand a @${username}`);
    return { claimedCount };
  } catch (e) {
    console.warn('[standDynamicService] Error reclamando publicaciones del stand:', e);
    return { claimedCount: 0 };
  }
}
