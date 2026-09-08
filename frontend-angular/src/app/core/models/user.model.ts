export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'TRAINER' | 'BRANCH ADMIN';
  phone?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  medicalNotes?: string;
  ptSessionsBalance?: number;
  qrToken?: string;
  assignedTrainerId?: any;
  createdAt?: string;
  updatedAt?: string;
}
