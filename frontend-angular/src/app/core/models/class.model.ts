export interface GymClass {
  _id: string;
  title: string;
  description?: string;
  category: 'HIIT' | 'YOGA' | 'STRENGTH' | 'SPINNING' | 'CROSSFIT' | 'BOXING' | 'PILATES' | 'GENERAL';
  difficulty?: string;
  room?: string;
  instructorName?: string;
  trainerId: string | any;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface Booking {
  _id: string;
  classId?: GymClass;
  trainerId?: any;
  memberId: string | any;
  bookingType: 'CLASS' | 'PERSONAL_TRAINING';
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  date?: string;
  notes?: string;
  bookedAt: string;
}
