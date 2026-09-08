export interface Equipment {
  _id: string;
  name: string;
  serialNumber: string;
  category: 'CARDIO' | 'FREE_WEIGHTS' | 'MACHINES' | 'CROSSFIT' | 'ACCESSORIES';
  locationRoom?: string;
  status: 'OPERATIONAL' | 'MAINTENANCE_REQUIRED' | 'OUT_OF_ORDER';
  lastServicedDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}
