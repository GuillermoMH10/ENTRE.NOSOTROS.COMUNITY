/**
 * Generates a unique, high-quality, friendly avatar URL for a user
 * based on their username or email seed.
 */
export function generateRandomAvatar(seed: string): string {
  const cleanSeed = encodeURIComponent(seed.trim().toLowerCase() || 'usuario');
  // Styles: bottts, adventurer, notionists, micah, avataaars
  const styles = ['notionists', 'adventurer', 'bottts', 'micah', 'croodles'];
  // Pick deterministic or random style
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  return `https://api.dicebear.com/7.x/${randomStyle}/png?seed=${cleanSeed}&backgroundColor=f5efeb,faf7f5,efe9e4`;
}
