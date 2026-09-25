import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  increment,
} from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Post, PostComment, ReactionType, HashtagItem } from '../types/post';

/**
 * Uploads an image or video to Firebase Storage and returns the public download URL
 */
export async function uploadMediaToStorage(
  mediaSource: string,
  storagePath: string
): Promise<string> {
  const storageRef = ref(storage, storagePath);

  // If already a remote URL, return as is
  if (mediaSource.startsWith('http://') || mediaSource.startsWith('https://')) {
    return mediaSource;
  }

  const isVideo =
    storagePath.endsWith('.mp4') ||
    storagePath.endsWith('.mov') ||
    mediaSource.includes('video/') ||
    mediaSource.startsWith('data:video');

  // If base64 data URL, upload with uploadString (fastest and most reliable)
  if (mediaSource.startsWith('data:')) {
    await uploadString(storageRef, mediaSource, 'data_url');
    return await getDownloadURL(storageRef);
  }

  // Otherwise upload blob via fetch with appropriate content-type metadata
  const response = await fetch(mediaSource);
  const blob = await response.blob();
  await uploadBytes(storageRef, blob, {
    contentType: isVideo ? 'video/mp4' : 'image/jpeg',
  });
  return await getDownloadURL(storageRef);
}

/**
 * Creates a new Post in Firestore and uploads images/videos to Firebase Storage
 */
export async function createPost(
  authorId: string,
  authorUsername: string,
  authorAvatarUrl: string,
  content: string,
  mediaSources: string[],
  rawHashtags: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const postId = 'post_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const timestamp = Date.now();
    const createdAt = new Date().toISOString();

    // Clean and normalize hashtags
    const cleanedHashtags = rawHashtags
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
      .map((h) => h.trim())
      .filter((h) => h.length > 1);

    // Upload all images/videos to Firebase Storage first
    const uploadedMediaUrls: string[] = [];
    for (let i = 0; i < mediaSources.length; i++) {
      const source = mediaSources[i];
      const isVideo =
        source.toLowerCase().endsWith('.mp4') ||
        source.toLowerCase().endsWith('.mov') ||
        source.toLowerCase().endsWith('.webm') ||
        source.toLowerCase().includes('video');
      const ext = isVideo ? 'mp4' : 'jpg';
      const storagePath = `posts/${postId}/media_${i}_${Date.now()}.${ext}`;
      const publicUrl = await uploadMediaToStorage(source, storagePath);
      uploadedMediaUrls.push(publicUrl);
    }

    const newPost: Post = {
      id: postId,
      authorId,
      authorUsername,
      authorAvatarUrl,
      content: content.trim(),
      imageUrls: uploadedMediaUrls, // Lightweight public storage URLs (<150 bytes each)
      hashtags: cleanedHashtags,
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

    // Save post document to Firestore
    await setDoc(doc(db, 'posts', postId), newPost);

    // Register hashtags in background
    cleanedHashtags.forEach(async (tag) => {
      const tagKey = tag.replace('#', '').toLowerCase();
      if (tagKey) {
        try {
          const tagRef = doc(db, 'hashtags', tagKey);
          const tagSnap = await getDoc(tagRef);
          if (tagSnap.exists()) {
            await updateDoc(tagRef, { count: increment(1) });
          } else {
            await setDoc(tagRef, {
              id: tagKey,
              tag: tag.startsWith('#') ? tag : `#${tag}`,
              count: 1,
            });
          }
        } catch (e) {
          // Non-critical background task
        }
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error al crear post:', error);
    return { success: false, error: error.message || 'Error al conectar con la base de datos' };
  }
}

/**
 * Subscribes to real-time posts from Firestore
 */
export function subscribeToPosts(callback: (posts: Post[]) => void): () => void {
  const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const postsList: Post[] = [];
      snapshot.forEach((docSnap) => {
        postsList.push({ ...docSnap.data(), id: docSnap.id } as Post);
      });
      callback(postsList);
    },
    (error) => {
      console.warn('Error en listener de posts:', error);
    }
  );
}

/**
 * React to a post (add, change or toggle reaction)
 */
export async function togglePostReaction(
  postId: string,
  userId: string,
  newReaction: ReactionType
): Promise<void> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;

    const postData = postSnap.data() as Post;
    const userReactions = { ...(postData.userReactions || {}) };
    const currentReaction = userReactions[userId];
    const reactions = { ...(postData.reactions || { teEscucho: 0, teAbrazo: 0, noEstasSolo: 0, fuerza: 0 }) };

    if (currentReaction === newReaction) {
      delete userReactions[userId];
      reactions[newReaction] = Math.max(0, (reactions[newReaction] || 1) - 1);
    } else {
      if (currentReaction) {
        reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 1) - 1);
      }
      userReactions[userId] = newReaction;
      reactions[newReaction] = (reactions[newReaction] || 0) + 1;
    }

    await updateDoc(postRef, {
      reactions,
      userReactions,
    });
  } catch (error) {
    console.error('Error al reaccionar a post:', error);
  }
}

/**
 * Toggle bookmark / save post for a user
 */
export async function toggleSavePost(postId: string, userId: string): Promise<boolean> {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return false;

    const postData = postSnap.data() as Post;
    const savedBy = [...(postData.savedBy || [])];
    const index = savedBy.indexOf(userId);

    let isSaved = false;
    if (index > -1) {
      savedBy.splice(index, 1);
      isSaved = false;
    } else {
      savedBy.push(userId);
      isSaved = true;
    }

    await updateDoc(postRef, { savedBy });
    return isSaved;
  } catch (error) {
    console.error('Error al guardar post:', error);
    return false;
  }
}

/**
 * Fetches popular hashtags from Firestore
 */
export async function fetchHashtags(): Promise<HashtagItem[]> {
  try {
    const hashQuery = query(collection(db, 'hashtags'), orderBy('count', 'desc'), limit(15));
    const snap = await getDocs(hashQuery);
    const list: HashtagItem[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as HashtagItem);
    });
    return list;
  } catch (error) {
    return [];
  }
}

/**
 * Adds a comment to a post and uploads comment image to Firebase Storage if provided
 */
export async function addComment(
  postId: string,
  authorId: string,
  authorUsername: string,
  authorAvatarUrl: string,
  text: string,
  imageSource?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const commentId = 'comment_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    let publicImageUrl = '';

    if (imageSource) {
      const storagePath = `posts/${postId}/comments/${commentId}.jpg`;
      publicImageUrl = await uploadMediaToStorage(imageSource, storagePath);
    }

    const newComment: any = {
      id: commentId,
      postId,
      authorId,
      authorUsername,
      authorAvatarUrl,
      text: text.trim(),
      authorHeart: false,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
    };

    if (publicImageUrl) {
      newComment.imageUrl = publicImageUrl;
    }

    const commentDocRef = doc(db, `posts/${postId}/comments`, commentId);
    await setDoc(commentDocRef, newComment);

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error al agregar comentario:', error);
    return { success: false, error: error.message || 'Error al comentar' };
  }
}

/**
 * Subscribes to real-time comments of a post
 */
export function subscribeToComments(
  postId: string,
  callback: (comments: PostComment[]) => void
): () => void {
  const commentsQuery = query(
    collection(db, `posts/${postId}/comments`),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(
    commentsQuery,
    (snapshot) => {
      const list: PostComment[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as PostComment);
      });
      callback(list);
    },
    (error) => {
      console.warn('Error en listener de comentarios:', error);
    }
  );
}

/**
 * Toggle author heart on a comment
 */
export async function toggleCommentHeart(
  postId: string,
  commentId: string,
  currentHeart: boolean
): Promise<void> {
  try {
    const commentRef = doc(db, `posts/${postId}/comments`, commentId);
    await updateDoc(commentRef, {
      authorHeart: !currentHeart,
    });
  } catch (error) {
    console.error('Error al actualizar corazón del autor:', error);
  }
}

/**
 * Deletes a post from Firestore
 */
export async function deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar publicación:', error);
    return { success: false, error: error.message || 'Error al eliminar la publicación' };
  }
}

/**
 * Updates post content and hashtags
 */
export async function updatePostContent(
  postId: string,
  content: string,
  rawHashtags: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanedHashtags = rawHashtags
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
      .map((h) => h.trim())
      .filter((h) => h.length > 1);

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      content: content.trim(),
      hashtags: cleanedHashtags,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error al actualizar publicación:', error);
    return { success: false, error: error.message || 'Error al actualizar' };
  }
}

/**
 * Subscribes in real-time to posts created by a specific user (Mis publicaciones)
 */
export function subscribeToUserPosts(
  userId: string,
  callback: (posts: Post[]) => void
): () => void {
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Post);
      });
      callback(list);
    },
    (error) => {
      console.warn('Error al obtener publicaciones de usuario:', error);
    }
  );
}

/**
 * Subscribes in real-time to posts saved by a specific user (Guardados)
 */
export function subscribeToSavedPosts(
  userId: string,
  callback: (posts: Post[]) => void
): () => void {
  const q = query(
    collection(db, 'posts'),
    where('savedBy', 'array-contains', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ ...docSnap.data(), id: docSnap.id } as Post);
      });
      callback(list);
    },
    (error) => {
      console.warn('Error al obtener publicaciones guardadas:', error);
    }
  );
}

/**
 * Subscribes in real-time to posts where user has reacted (Estuve presente)
 */
export function subscribeToReactedPosts(
  userId: string,
  callback: (posts: Post[]) => void
): () => void {
  // Listen to feed posts and filter those where userReactions[userId] is present
  const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(100));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: Post[] = [];
      snapshot.forEach((docSnap) => {
        const postData = { ...docSnap.data(), id: docSnap.id } as Post;
        if (postData.userReactions && postData.userReactions[userId]) {
          list.push(postData);
        }
      });
      callback(list);
    },
    (error) => {
      console.warn('Error al obtener publicaciones con reacciones del usuario:', error);
    }
  );
}

