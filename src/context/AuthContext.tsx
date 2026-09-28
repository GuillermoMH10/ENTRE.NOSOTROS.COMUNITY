import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { hashPassword } from '../utils/crypto';
import { generateRandomAvatar } from '../utils/avatar';
import { UserProfile, AuthContextType } from '../types/auth';
import { syncUserAvatarInPosts } from '../services/postsService';

const STORAGE_KEY = '@entre_nosotros_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from AsyncStorage on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error cargando sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  // Login handler with Firestore lookup and SHA-256 password hash comparison
  const login = async (
    emailOrUsername: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanInput = emailOrUsername.trim().toLowerCase();
      if (!cleanInput || !password) {
        return { success: false, error: 'Por favor completa todos los campos.' };
      }

      const usersRef = collection(db, 'users');

      // Search by email first
      const emailQuery = query(usersRef, where('email', '==', cleanInput));
      let querySnapshot = await getDocs(emailQuery);

      // If not found by email, try by username
      if (querySnapshot.empty) {
        const usernameQuery = query(usersRef, where('usernameLower', '==', cleanInput));
        querySnapshot = await getDocs(usernameQuery);
      }

      if (querySnapshot.empty) {
        return { success: false, error: 'No existe una cuenta con ese correo o usuario.' };
      }

      const userDoc = querySnapshot.docs[0].data();
      const inputPasswordHash = await hashPassword(password);

      if (userDoc.passwordHash !== inputPasswordHash) {
        return { success: false, error: 'Contraseña incorrecta. Por favor intenta de nuevo.' };
      }

      const loggedUser: UserProfile = {
        id: userDoc.id || querySnapshot.docs[0].id,
        email: userDoc.email,
        username: userDoc.username,
        avatarUrl: userDoc.avatarUrl || generateRandomAvatar(userDoc.username),
        coverPhotoUrl: userDoc.coverPhotoUrl || undefined,
        bio: userDoc.bio || undefined,
        createdAt: userDoc.createdAt,
        followingCount: userDoc.followingCount || 0,
        followersCount: userDoc.followersCount || 0,
      };

      setUser(loggedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
      return { success: true };
    } catch (error: any) {
      console.error('Error en inicio de sesión:', error);
      return {
        success: false,
        error: error.message || 'Ocurrió un error al iniciar sesión. Intenta nuevamente.',
      };
    }
  };

  // Register handler with Firestore and unique random avatar
  const register = async (
    email: string,
    username: string,
    password: string,
    termsAccepted: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanUsername = username.trim();
      const cleanUsernameLower = cleanUsername.toLowerCase();

      if (!cleanEmail || !cleanUsername || !password) {
        return { success: false, error: 'Por favor llena todos los campos.' };
      }

      if (!termsAccepted) {
        return { success: false, error: 'Debes aceptar los términos y condiciones.' };
      }

      const usersRef = collection(db, 'users');

      // Check if email already exists
      const emailCheck = query(usersRef, where('email', '==', cleanEmail));
      const emailSnap = await getDocs(emailCheck);
      if (!emailSnap.empty) {
        return { success: false, error: 'Este correo ya se encuentra registrado.' };
      }

      // Check if username already exists
      const usernameCheck = query(usersRef, where('usernameLower', '==', cleanUsernameLower));
      const usernameSnap = await getDocs(usernameCheck);
      if (!usernameSnap.empty) {
        return { success: false, error: 'Este nombre de usuario ya está en uso.' };
      }

      // Hash password with salt
      const passwordHash = await hashPassword(password);

      // Generate unique random avatar
      const avatarUrl = generateRandomAvatar(cleanUsername);

      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const createdAt = new Date().toISOString();

      const newUserData = {
        id: userId,
        email: cleanEmail,
        username: cleanUsername,
        usernameLower: cleanUsernameLower,
        passwordHash: passwordHash,
        avatarUrl: avatarUrl,
        termsAccepted: true,
        createdAt: createdAt,
      };

      // Save into Firestore users collection
      await setDoc(doc(db, 'users', userId), newUserData);

      const newUserProfile: UserProfile = {
        id: userId,
        email: cleanEmail,
        username: cleanUsername,
        avatarUrl: avatarUrl,
        coverPhotoUrl: undefined,
        bio: undefined,
        createdAt: createdAt,
        followingCount: 0,
        followersCount: 0,
      };

      setUser(newUserProfile);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUserProfile));

      return { success: true };
    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      return {
        success: false,
        error: error.message || 'Error al conectar con Firestore. Intenta nuevamente.',
      };
    }
  };

  // Update user profile fields (cover, avatar, bio, etc.)
  const updateUserProfile = async (
    updates: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'No hay usuario autenticado.' };
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updates);

      const updatedUser: UserProfile = {
        ...user,
        ...updates,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // If avatarUrl was updated, sync all existing posts in background
      if (updates.avatarUrl) {
        syncUserAvatarInPosts(user.id, updates.avatarUrl).catch((err) =>
          console.warn('Error background syncing avatar:', err)
        );
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar el perfil.',
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
