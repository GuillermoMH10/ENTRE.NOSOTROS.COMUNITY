import * as Crypto from 'expo-crypto';

// Secret salt used for hashing to prevent dictionary and rainbow table attacks
const SALT_SECRET = "EntreNosotros_Secure_Salt_2026_@App";

/**
 * Hashes a plaintext password securely using SHA-256 with an application salt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltedString = `${SALT_SECRET}:${password}:${SALT_SECRET}`;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    saltedString
  );
  return digest;
}
