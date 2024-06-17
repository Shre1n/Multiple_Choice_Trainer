import {Component, OnInit} from '@angular/core';
import {IonicModule, ToastController} from "@ionic/angular";
import {Achievement, AchievementsService} from "../services/achievements.service";
import {AuthService} from "../services/auth.service";
import {NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-achievements',
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.scss'],
  imports: [
    IonicModule,
    NgOptimizedImage
  ],
  standalone: true
})
export class AchivementsComponent implements OnInit {

  achievements: Achievement[] = [];
  notAchieved: Achievement[] = [];

  constructor(private achievementsService: AchievementsService, private authService: AuthService, private toastCtrl: ToastController) {}

  async ngOnInit(): Promise<void> {
    this.authService.getAuth().onAuthStateChanged(async user => {
      if (user) {
        try {
          this.achievements = await this.achievementsService.getUserAchievements(user.uid);
          this.notAchieved = await this.achievementsService.getAchievements(user.uid);
        } catch (error) {
          console.error('Failed to load user achievements', error);
          await this.presentToast('top', "Failed to load user achievements!");
        }
      } else {
        this.notAchieved = await this.loadServerAchievements();
        await this.presentToast("top", "Sign Up to collect Achievements!")
        console.error('User is not authenticated');
      }
    });

    this.authService.getCurrentUserId().then(async userId => {
      if (userId) {
        try {
          this.achievements = await this.achievementsService.getUserAchievements(userId);
          this.achievements = await this.achievementsService.getAchievements(userId);
        } catch (error) {
          console.error('Failed to load user achievements', error);
          await this.presentToast('top',"No Authenticated User!");
        }
      }
    });

  }

  async loadServerAchievements():Promise<Achievement[]> {
    try {
      const achievements = await this.achievementsService.getAllServerAchievements().toPromise();
      console.log('Loaded Server Achievements:', achievements);
      if (!achievements) {
        return [];
      }
      // @ts-ignore
      return Object.values(achievements.achievements).map((achievement: Achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        achieved: achievement.achieved,
        img: achievement.img
      }));
    } catch (error) {
      console.error('Error loading server achievements:', error);
      await this.presentToast('top',"Error loading server achievements!");
      return [];
    }
  }

  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 7000,
      position: position,
    });

    await toast.present();
  }

}
