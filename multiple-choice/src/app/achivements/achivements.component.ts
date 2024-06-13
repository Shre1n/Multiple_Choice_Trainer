import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {AchievementsService, Achievement} from "../services/achievements.service";
import {ToastController} from "@ionic/angular/standalone";

@Component({
  selector: 'app-achivements',
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class AchivementsComponent{

  achievements: Achievement[] = [];
  errorMessage: string = 'No Connection to Achievement Server! 😢';

  constructor(private achievementsService: AchievementsService, private toastCtrl: ToastController) {}

  ngOnInit(): void {
    this.loadAchievements();
    // this.achievementsService.loadAchievements().subscribe(data => this.achievements = data);
  }

  loadAchievements() {
    this.achievementsService.loadAchievements().subscribe(
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
