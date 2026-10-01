export interface Psychologist {
  id: string;
  nombre: string;
  imagen: string;
  especialidad: string;
  correo: string;
  telefono: string;
  ubicacion: string; // May be a Google Maps URL or text address
  descripcion: string;
  activo?: boolean;
  createdAt?: any;
}
