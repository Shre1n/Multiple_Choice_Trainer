import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Achievement {
  title: string;
  description: string;
  dateAchieved: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private apiUrl = 'http://localhost:8888';

  constructor(private http: HttpClient) {}

  addAchievement(userId: string, achievement: Achievement): Observable<any> {
    const url = `${this.apiUrl}/users/${userId}/achievements`;
    const body = { ...achievement, dateAchieved: achievement.dateAchieved.toISOString() };
    return this.http.post(url, body);
  }

  getAchievements(userId: string): Observable<Achievement[]> {
    const url = `${this.apiUrl}/users/${userId}/achievements`;
    return this.http.get<Achievement[]>(url);
  }
}
