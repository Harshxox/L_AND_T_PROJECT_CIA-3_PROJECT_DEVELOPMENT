export interface Transaction {
  _id: string;
  transactionId: string;
  receiptNumber: string;
  memberId: any;
  itemType: 'MEMBERSHIP_PLAN' | 'PT_PACKAGE' | 'DAY_PASS';
  itemName: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface Receipt {
  receiptNumber: string;
  transactionId: string;
  memberName: string;
  memberEmail: string;
  item: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  date: string;
}
