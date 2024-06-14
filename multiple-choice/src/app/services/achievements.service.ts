import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  private baseUrl = 'http://localhost:8888/achievements';
  private achievements: Achievement[] = [];
  private userId: string | null = null;

  constructor(private http: HttpClient) {}


  getUserAchievements(userId: string): Observable<any[]> {
    const url = `${this.baseUrl}/${userId}`;
    return this.http.get<any[]>(url);
  }

  generateUserAchievements(userId: string): Observable<any> {
    const url = `${this.baseUrl}/generate/${userId}`;
    return this.http.post<any>(url, {});
  }

  // Set the current user ID
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Load achievements for the current user
  loadAchievements(): Observable<Achievement[]> {
    const url = `${this.baseUrl}/${this.userId}`;
    return this.http.get<Achievement[]>(url).pipe(
      map(achievements => {
        this.achievements = achievements;
        return achievements;
      })
    );
  }

  // Load all achievements from the server
  getAllServerAchievements(): Observable<Achievement[]> {
    const url = `${this.baseUrl}`;
    return this.http.get<Achievement[]>(url);
  }

  // Update the status of a specific achievement
  updateAchievementStatus(id: string, achieved: boolean): void {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement) {
      achievement.achieved = achieved;
      this.saveAchievements();
    }
  }

  // Save achievements for the current user
  saveAchievements(): void {
    const url = `${this.baseUrl}/${this.userId}`;
    this.http.post(url, this.achievements).subscribe();
  }

  // Get a specific achievement by ID
  getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id);
  }

  // Get all achievements for the current user
  getAllAchievements(): Achievement[] {
    return this.achievements;
  }
}
