export interface Trainer {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  experienceYears?: number;
  bio?: string;
  hourlyRate?: number;
  rating?: number;
  ratingCount?: number;
  certifications?: string[];
  status: 'ACTIVE' | 'INACTIVE';
}
