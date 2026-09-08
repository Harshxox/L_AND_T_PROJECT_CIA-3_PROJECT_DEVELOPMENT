import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GymClass } from '../models/class.model';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = 'http://localhost:5000/api/classes';

  constructor(private http: HttpClient) {}

  getClasses(): Observable<{ success: boolean; data: { classes: GymClass[] } }> {
    return this.http.get<any>(this.apiUrl);
  }

  bookClass(classId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${classId}/book`, {});
  }

  createClass(classData: Partial<GymClass>): Observable<any> {
    return this.http.post(this.apiUrl, classData);
  }

  submitReview(payload: { targetType: 'CLASS' | 'TRAINER'; classId?: string; trainerId?: string; rating: number; comment: string }): Observable<any> {
    return this.http.post('http://localhost:5000/api/reviews', payload);
  }
}
