import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {AchievementsService, Achievement} from "../services/achievements.service";
import {ToastController} from "@ionic/angular/standalone";

import 'firebase/auth';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-achivements',
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class AchivementsComponent implements OnInit{

  achievements: Achievement[] = [];
  errorMessage: string = 'No Connection to Achievement Server! 😢';


  constructor(private achievementsService: AchievementsService,private authService: AuthService, private toastCtrl: ToastController) {}

  ngOnInit(): void {
    this.authService.getAuth().onAuthStateChanged(async user => {
      if (user) {
        this.achievementsService.setUserId(user.uid);
        try {
          this.achievements = await this.authService.getUserAchievements(user.uid);
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
        this.loadAchievements();
      }
    });


    this.loadServerAchievements();
    // this.achievementsService.loadAchievements().subscribe(data => this.achievements = data);
  }

  loadServerAchievements() {
    this.achievementsService.getAllServerAchievements().subscribe(
      (response) => {
        console.log('Achievements Loaded:', response); // Log the actual response
        this.achievements = response;
      },
      (error) => {
        console.error('Error loading achievements:', error);
        this.presentToast('middle');
      }
    );
  }

  loadAchievements() {
    this.achievementsService.loadAchievements().subscribe(
      (response) => {
        console.log('Achievements Loaded for user:', response); // Log the actual response
        this.achievements = response;
      },
      (error) => {
        console.error('Error loading achievements:', error);
        this.presentToast('middle');
      }
    );
  }

  async presentToast(position: 'middle') {
    const toast = await this.toastCtrl.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }

  onAchievementComplete(id: string): void {
    const achievement = this.achievementsService.getAchievementById(id);
    if (achievement) {
      achievement.achieved = true;
      this.achievementsService.updateAchievementStatus(id, true);
    }
  }

}
