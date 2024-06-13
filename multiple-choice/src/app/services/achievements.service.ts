import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

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

  private achievementsUrl = 'http://localhost:8888/achievements';
  private achievements: Achievement[] = [];

  constructor(private http: HttpClient) {
  }

  loadAchievements(): Observable<Achievement[]> {
    return this.http.get<any>(this.achievementsUrl);
  }

  updateAchievementStatus(id: string, achieved: boolean): void {
    const achievement = this.achievements.find(a => a.id === id);
    if (achievement) {
      achievement.achieved = achieved;
      this.saveAchievements();
    }
  }


  saveAchievements(): void {
    this.http.post(this.achievementsUrl, this.achievements).subscribe();
  }

  getAchievementById(id: string): Achievement | undefined {
    return this.achievements.find(a => a.id === id);
  }

  getAllAchievements(): Achievement[] {
    return this.achievements;
  }
}
