import {Component, OnInit} from '@angular/core';
import {IonicModule, ToastController} from "@ionic/angular";
import {Achievement, AchievementsService} from "../services/achievements.service";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-achievements',
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class AchivementsComponent implements OnInit {

  achievements: Achievement[] = [];
  serverAchievements: Achievement[] = [];
  errorMessage: string = 'No Connection to Achievement Server! 😢';

  constructor(private achievementsService: AchievementsService, private authService: AuthService, private toastCtrl: ToastController) {}

  async ngOnInit(): Promise<void> {
    this.authService.getAuth().onAuthStateChanged(async user => {
      if (user) {
        try {
          this.achievements = await this.achievementsService.getAchievements(user.uid);
        } catch (error) {
          console.error('Failed to load user achievements', error);
          await this.presentToast('middle');
        }
      } else {
        console.error('User is not authenticated');
      }
    });

    this.authService.getCurrentUserId().then(async userId => {
      if (userId) {
        try {
          this.achievements = await this.achievementsService.getAchievements(userId);
        } catch (error) {
          console.error('Failed to load user achievements', error);
          await this.presentToast('middle');
        }
      }
    });

    await this.loadServerAchievements();
  }

  async loadServerAchievements() {
    try {
      const achievements = await this.achievementsService.getAllServerAchievements().toPromise();
      const achievementsArray: Achievement[] = [];
      // @ts-ignore
      Object.keys(achievements.achievements).forEach(key => {
        // @ts-ignore
        const achievement = achievements.achievements[key];
        achievementsArray.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          achieved: achievement.achieved
        });
      });
      this.serverAchievements = achievementsArray;
    } catch (error) {
      console.error('Error loading server achievements:', error);
      await this.presentToast('middle');
    }
  }

  async presentToast(position: 'middle') {
    const toast = await this.toastCtrl.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }

}
