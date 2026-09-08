export interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  isActive: boolean;
}

export interface Membership {
  _id: string;
  memberId: string | any;
  planId: MembershipPlan;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'FROZEN';
  isFrozen?: boolean;
  freezeStartDate?: string;
  freezeEndDate?: string;
  renewalCount: number;
  purchaseDate: string;
}
