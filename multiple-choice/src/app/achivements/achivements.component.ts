import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import { Achievement, AchievementsService } from "../services/achievements.service";
import { AuthService } from "../services/auth.service";
import {doc, getDoc} from "@angular/fire/firestore";

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
  errorMessage: string = 'No Connection to Achievement Server! 😢';

  constructor(private achievementsService: AchievementsService, private authService: AuthService, private toastCtrl: ToastController) {}

  ngOnInit(): void {
    this.authService.getAuth().onAuthStateChanged(async user => {
      if (user) {
        try {
          // hier laden von user spezifischen Achievements
        } catch (error) {
          console.error('Failed to load user achievements', error);
          await this.presentToast('middle');
        }
      } else {
        console.error('User is not authenticated');
      }
    });

    // Lade Achievements, falls bereits eine UserID vorhanden ist (z.B. bei page refresh)
    this.authService.getCurrentUserId().then(userId => {
      if (userId) {
        // this.loadAchievements(userId);
      }
    });

    this.loadServerAchievements();
  }

  async loadServerAchievements() {
    try {
      const achievements = await this.achievementsService.getAllServerAchievements().toPromise();
      console.log('Server Achievements Loaded:', achievements);
      this.achievements = achievements || [];
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
