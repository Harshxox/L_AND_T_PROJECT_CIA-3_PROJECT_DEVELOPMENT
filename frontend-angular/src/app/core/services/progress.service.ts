import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgressLog } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:5000/api/progress';

  constructor(private http: HttpClient) {}

  logProgress(log: Partial<ProgressLog>): Observable<{ success: boolean; data: { log: ProgressLog } }> {
    return this.http.post<any>(this.apiUrl, log);
  }

  getMyProgress(): Observable<{ success: boolean; data: { logs: ProgressLog[] } }> {
    return this.http.get<any>(`${this.apiUrl}/my`);
  }

  getMemberProgress(memberId: string): Observable<{ success: boolean; data: { logs: ProgressLog[] } }> {
    return this.http.get<any>(`${this.apiUrl}/member/${memberId}`);
  }
}
