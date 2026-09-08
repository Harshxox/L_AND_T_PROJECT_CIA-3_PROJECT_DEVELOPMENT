import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trainer } from '../models/trainer.model';
import { User } from '../models/user.model';
import { WorkoutPlan } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private apiUrl = 'http://localhost:5000/api/trainers';

  constructor(private http: HttpClient) {}

  getAllTrainers(): Observable<{ success: boolean; data: { trainers: Trainer[] } }> {
    return this.http.get<any>(this.apiUrl);
  }

  getMyClients(): Observable<{ success: boolean; data: { clients: User[]; trainer: Trainer } }> {
    return this.http.get<any>(`${this.apiUrl}/portal/my-clients`);
  }

  logPTSession(memberId: string, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/portal/log-pt-session`, { memberId, notes });
  }

  getEarningsSummary(): Observable<{
    success: boolean;
    data: {
      trainer: Trainer;
      completedPTSessions: number;
      ratePerSession: number;
      totalEarnings: number;
      rating: number;
      ratingCount: number;
    }
  }> {
    return this.http.get<any>(`${this.apiUrl}/portal/earnings-summary`);
  }

  saveWorkoutPlan(plan: WorkoutPlan): Observable<any> {
    return this.http.post('http://localhost:5000/api/workout-plans', plan);
  }

  getMyWorkoutPlans(): Observable<{ success: boolean; data: { plans: WorkoutPlan[] } }> {
    return this.http.get<any>('http://localhost:5000/api/workout-plans/my');
  }
}
