import {Component} from '@angular/core';
import {IonicModule, NavController, ToastController} from "@ionic/angular";
import {Achievement, AchievementsService} from "../services/achievements.service";
import {AuthService} from "../services/auth.service";
import {NgOptimizedImage} from "@angular/common";
import {logOutOutline,footstepsOutline,golfOutline,rocketOutline,thumbsUpOutline,ribbonOutline,sparklesOutline,bodyOutline,shareSocialOutline,trophyOutline,schoolOutline} from "ionicons/icons";
import {addIcons} from "ionicons";

import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-achievements',
  templateUrl: './achivements.component.html',
  styleUrls: ['./achivements.component.scss'],
  imports: [
    IonicModule,
    NgOptimizedImage,
    FooterComponent
  ],
  standalone: true
})
export class AchivementsComponent{

  achievements: Achievement[] = []; // List of achieved achievements
  notAchieved: Achievement[] = []; // List of not achieved achievements
  isLoggedIn!: boolean; // User login status



  constructor(private achievementsService: AchievementsService,
              private authService: AuthService,
              private toastCtrl: ToastController,
              private navCtrl: NavController,
              ) {
    addIcons({logOutOutline,footstepsOutline,golfOutline,rocketOutline,thumbsUpOutline,ribbonOutline,sparklesOutline,bodyOutline,shareSocialOutline,trophyOutline,schoolOutline});

  }

  // Method called when the view is entered
  ionViewDidEnter(){
    this.checkLoginStatus();
  }



// Check the user's login status
  async checkLoginStatus() {
    const user = await this.authService.getCurrentUser();
    // Check if the user is logged in
    this.isLoggedIn = !!user;

    if (this.isLoggedIn) {
      try {
        const userId = await this.authService.getCurrentUserId();
        if (userId) {
          // Load user achievements
          this.achievements = await this.achievementsService.getUserAchievements(userId);
          // Load not achieved achievements
          this.notAchieved = await this.achievementsService.getAchievements(userId);
        } else {
          await this.presentToast('top', 'User ID not found.');
        }
      } catch (error) {
        console.error('Failed to load user achievements', error);
        await this.presentToast('top', 'Failed to load user achievements!');
      }
    } else {
      // Load server achievements if the user is not logged in
      this.notAchieved = await this.loadServerAchievements();
      await this.presentToast('top', 'Sign Up to collect Achievements!');
      console.error('User is not authenticated');
    }
  }

  // Load all achievements from the server
  async loadServerAchievements():Promise<Achievement[]> {
    try {
      const achievements = await this.achievementsService.getAllServerAchievements().toPromise();
      console.log('Loaded Server Achievements:', achievements);
      if (!achievements) {
        return [];
      }

      // @ts-ignore // Map the server achievements to the local Achievement structure
      return Object.values(achievements.achievements).map((achievement: Achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        achieved: achievement.achieved,
        icon: achievement.icon,
      }));
    } catch (error) {
      console.error('Error loading server achievements:', error);
      await this.presentToast('top',"Error loading server achievements!");
      return [];
    }
  }

  // Present a toast message
  async presentToast(position: 'top' | 'middle' | 'bottom', message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 5000,
      position: position,
    });

    await toast.present();
  }

  // Logout the user and navigate to the landing page
  async logout() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      // Mark the achievement as achieved
      await this.achievementsService.setIndexAchievement(user.uid, 7);
    }
    // Logout the user
    await this.authService.logout();
    // Update the login status
    this.isLoggedIn = false;
    // Navigate to the landing page
    await this.navCtrl.navigateRoot(['/landingpage']);
  }

}
