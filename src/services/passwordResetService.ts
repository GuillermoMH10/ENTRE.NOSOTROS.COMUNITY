import { collection, query, where, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { hashPassword } from '../utils/crypto';

// Configuration keys for EmailJS
export const EMAILJS_CONFIG = {
  serviceId: 'service_zw9chuh', // Gmail
  fallbackServiceId: 'service_kuv9dkm', // Outlook
  templateId: 'template_e0n0nfn',
  publicKey: 'q2bawUSFByczMAn5H',
};

export interface ResetCodeResult {
  success: boolean;
  error?: string;
  username?: string;
}

/**
 * Helper to call EmailJS REST API
 */
async function sendEmailViaEmailJS(
  serviceId: string,
  templateId: string,
  publicKey: string,
  params: Record<string, any>
): Promise<{ ok: boolean; errorText?: string }> {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: params,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { ok: false, errorText };
  }
  return { ok: true };
}

/**
 * Sends a 6-digit password reset verification code via EmailJS with automatic service fallback
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

    const templateParams = {
      email: cleanEmail,
      to_name: username,
      code: code,
      passcode: code,
      link: code,
      app_name: 'Entre Nosotros',
    };

    // Try primary service first (Gmail)
    let emailResult = await sendEmailViaEmailJS(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      EMAILJS_CONFIG.publicKey,
      templateParams
    );

    // If primary failed (e.g. Gmail token expired), try fallback (Outlook)
    if (!emailResult.ok && EMAILJS_CONFIG.fallbackServiceId) {
      console.warn(
        `Primary service ${EMAILJS_CONFIG.serviceId} failed (${emailResult.errorText}), trying fallback ${EMAILJS_CONFIG.fallbackServiceId}...`
      );
      emailResult = await sendEmailViaEmailJS(
        EMAILJS_CONFIG.fallbackServiceId,
        EMAILJS_CONFIG.templateId,
        EMAILJS_CONFIG.publicKey,
        templateParams
      );
    }

    if (!emailResult.ok) {
      console.warn('EmailJS error:', emailResult.errorText);
      if (emailResult.errorText?.includes('Invalid grant')) {
        return {
          success: false,
          error:
            'Tu servicio de Gmail en EmailJS necesita ser reconectado. Entra a EmailJS > Email Services > Reconectar cuenta de Gmail.',
        };
      }
      return {
        success: false,
        error: `Error de EmailJS: ${emailResult.errorText || 'No se pudo enviar el correo.'}`,
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
