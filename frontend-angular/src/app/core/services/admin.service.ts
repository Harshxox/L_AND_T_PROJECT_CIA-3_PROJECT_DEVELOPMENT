import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment } from '../models/equipment.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private equipUrl = 'http://localhost:5000/api/equipment';
  private adminUrl = 'http://localhost:5000/api/admin';
  private attUrl = 'http://localhost:5000/api/attendance';

  constructor(private http: HttpClient) {}

  getEquipment(): Observable<{ success: boolean; data: { equipment: Equipment[] } }> {
    return this.http.get<any>(this.equipUrl);
  }

  addEquipment(equipment: Partial<Equipment>): Observable<any> {
    return this.http.post(this.equipUrl, equipment);
  }

  updateEquipment(id: string, updates: Partial<Equipment>): Observable<any> {
    return this.http.put(`${this.equipUrl}/${id}`, updates);
  }

  deleteEquipment(id: string): Observable<any> {
    return this.http.delete(`${this.equipUrl}/${id}`);
  }

  getUsers(): Observable<{ success: boolean; data: { users: User[] } }> {
    return this.http.get<any>(`${this.adminUrl}/manage/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.adminUrl}/manage/users/${userId}/role`, { role });
  }

  assignTrainer(userId: string, trainerId: string): Observable<any> {
    return this.http.put(`${this.adminUrl}/manage/users/${userId}/assign-trainer`, { trainerId });
  }

  scanQRToken(qrToken: string): Observable<any> {
    return this.http.post(`${this.attUrl}/scan-qr`, { qrToken });
  }
}
