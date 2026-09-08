import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membership, MembershipPlan } from '../models/membership.model';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  private plansUrl = 'http://localhost:5000/api/plans';
  private memUrl = 'http://localhost:5000/api/memberships';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<{ success: boolean; data: { plans: MembershipPlan[] } }> {
    return this.http.get<any>(this.plansUrl);
  }

  getMyMemberships(): Observable<{ success: boolean; data: { memberships: Membership[] } }> {
    return this.http.get<any>(`${this.memUrl}/my`);
  }

  freezeMembership(id: string, freezeDays: number): Observable<any> {
    return this.http.put(`${this.memUrl}/${id}/freeze`, { freezeDays });
  }

  unfreezeMembership(id: string): Observable<any> {
    return this.http.put(`${this.memUrl}/${id}/unfreeze`, {});
  }
}
