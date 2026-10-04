export interface Psychologist {
  id: string;
  nombre: string;
  imagen: string; // Foto de perfil
  fotoPortada?: string; // Foto de portada
  especialidad: string;
  descripcion: string;
  modalidad?: 'Presencial' | 'En línea' | 'Presencial y En línea' | 'Ambos' | string;
  temas?: string[]; // Temas que trata
  correo: string;
  telefono?: string;
  whatsapp?: string; // WhatsApp
  sitioWeb?: string; // Sitio web
  ubicacion: string; // Ubicación / Consultorio
  verificado?: boolean;
  activo?: boolean;
  createdAt?: any;
}
