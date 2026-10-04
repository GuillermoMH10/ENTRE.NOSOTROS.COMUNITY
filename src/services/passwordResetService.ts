import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { hashPassword } from '../utils/crypto';

// Configuration keys for EmailJS
// Reemplaza estos valores con los de tu cuenta de EmailJS
export const EMAILJS_CONFIG = {
  serviceId: 'service_entre_nosotros', // Tu Service ID de EmailJS
  templateId: 'template_reset_pwd',    // Tu Template ID de EmailJS
  publicKey: 'YOUR_PUBLIC_KEY',         // Tu Public Key de EmailJS (Account > API Keys)
};

export interface ResetCodeResult {
  success: boolean;
  error?: string;
  username?: string;
}

/**
 * Sends a 6-digit password reset verification code via EmailJS
 */
export async function sendPasswordResetCode(email: string): Promise<ResetCodeResult> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Por favor ingresa tu correo electrónico.' };
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        success: false,
        error: 'No se encontró ninguna cuenta registrada con este correo electrónico.',
      };
    }

    const userDoc = snapshot.docs[0].data();
    const username = userDoc.username || 'Amigo(a)';

    // Generate secure 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Valid for 15 minutes

    // Save reset code to Firestore
    const resetRef = doc(db, 'password_resets', cleanEmail);
    await setDoc(resetRef, {
      email: cleanEmail,
      code,
      expiresAt,
      used: false,
      createdAt: Date.now(),
    });

    // Send email via EmailJS REST API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          email: cleanEmail,
          to_name: username,
          code: code,
          passcode: code,
          link: code,
          app_name: 'Entre Nosotros',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('EmailJS API response not OK:', errText);
      // If EmailJS has placeholder keys, we provide guidance
      if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        return {
          success: true,
          username,
          error: 'Configura tus credenciales de EmailJS en src/services/passwordResetService.ts',
        };
      }
      return {
        success: false,
        error: 'No se pudo enviar el correo de recuperación. Verifica la configuración de EmailJS.',
      };
    }

    return { success: true, username };
  } catch (error: any) {
    console.error('Error in sendPasswordResetCode:', error);
    return {
      success: false,
      error: error.message || 'Error al solicitar restablecimiento de contraseña.',
    };
  }
}

/**
 * Verifies if the 6-digit code is valid and not expired
 */
export async function verifyResetCode(
  email: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, error: 'El código debe tener 6 dígitos.' };
    }

    const resetRef = collection(db, 'password_resets');
    const q = query(
      resetRef,
      where('email', '==', cleanEmail),
      where('code', '==', cleanCode),
      where('used', '==', false)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'Código inválido o ya utilizado.' };
    }

    const resetData = snapshot.docs[0].data();
    if (Date.now() > resetData.expiresAt) {
      return { success: false, error: 'El código ha expirado. Solicita uno nuevo.' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying code:', error);
    return { success: false, error: 'Error al verificar el código.' };
  }
}

/**
 * Updates the user's password in Firestore after code verification
 */
export async function completePasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();

    // Verify code first
    const verification = await verifyResetCode(cleanEmail, code);
    if (!verification.success) {
      return verification;
    }

    // Find the user document
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'No se encontró la cuenta de usuario.' };
    }

    const userDocId = snapshot.docs[0].id;

    // Hash new password securely
    const newPasswordHash = await hashPassword(newPassword);

    // Update passwordHash in Firestore
    const userDocRef = doc(db, 'users', userDocId);
    await updateDoc(userDocRef, {
      passwordHash: newPasswordHash,
      updatedAt: Date.now(),
    });

    // Mark reset code as used
    const resetRef = doc(db, 'password_resets', cleanEmail);
    await updateDoc(resetRef, {
      used: true,
      usedAt: Date.now(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error in completePasswordReset:', error);
    return {
      success: false,
      error: error.message || 'No se pudo actualizar la contraseña. Intenta nuevamente.',
    };
  }
}
