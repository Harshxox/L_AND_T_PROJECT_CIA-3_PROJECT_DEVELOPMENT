import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, Receipt } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:5000/api/payments';

  constructor(private http: HttpClient) {}

  validateCoupon(couponCode: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-coupon`, { couponCode, amount });
  }

  processCheckout(payload: {
    planId?: string;
    ptPackageCount?: number;
    paymentMethod?: string;
    couponCode?: string;
  }): Observable<{ success: boolean; data: { transaction: Transaction; receipt: Receipt; membership?: any } }> {
    return this.http.post<any>(`${this.apiUrl}/checkout`, payload);
  }

  getMyReceipts(): Observable<{ success: boolean; data: { transactions: Transaction[] } }> {
    return this.http.get<any>(`${this.apiUrl}/my-receipts`);
  }

  getAdminLedger(): Observable<{
    success: boolean;
    data: {
      totalRevenue: number;
      totalDiscounts: number;
      transactionCount: number;
      transactions: Transaction[];
    }
  }> {
    return this.http.get<any>(`${this.apiUrl}/admin/ledger`);
  }
}
