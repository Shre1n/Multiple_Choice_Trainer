import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GestureController, GestureDetail, IonicModule, NavController, ToastController} from "@ionic/angular";
import {Achievement, AchievementsService} from "../services/achievements.service";
import {AuthService} from "../services/auth.service";
import {NgOptimizedImage} from "@angular/common";
import {logOutOutline, personOutline, footstepsOutline,golfOutline,rocketOutline,thumbsUpOutline,ribbonOutline,sparklesOutline,bodyOutline,shareSocialOutline,trophyOutline,schoolOutline} from "ionicons/icons";
import {addIcons} from "ionicons";
import {Router} from "@angular/router";
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
export class AchivementsComponent implements OnInit{

  achievements: Achievement[] = [];
  notAchieved: Achievement[] = [];
  isLoggedIn!: boolean;



  constructor(private achievementsService: AchievementsService,
              private router: Router,
              private authService: AuthService,
              private toastCtrl: ToastController,
              private navCtrl: NavController,
              private gestureCtrl: GestureController,

              ) {
    addIcons({logOutOutline,footstepsOutline,golfOutline,rocketOutline,thumbsUpOutline,ribbonOutline,sparklesOutline,bodyOutline,shareSocialOutline,trophyOutline,schoolOutline});

  }

  ngOnInit() {

  }


  ionViewDidEnter(){
    this.checkLoginStatus();
  }




  async checkLoginStatus() {
    const user = await this.authService.getCurrentUser();
    this.isLoggedIn = !!user;

    if (this.isLoggedIn) {
      try {
        const userId = await this.authService.getCurrentUserId();
        if (userId) {
          this.achievements = await this.achievementsService.getUserAchievements(userId);
          this.notAchieved = await this.achievementsService.getAchievements(userId);
        } else {
          await this.presentToast('top', 'User ID not found.');
        }
      } catch (error) {
        console.error('Failed to load user achievements', error);
        await this.presentToast('top', 'Failed to load user achievements!');
      }
    } else {
      this.notAchieved = await this.loadServerAchievements();
      await this.presentToast('top', 'Sign Up to collect Achievements!');
      console.error('User is not authenticated');
    }
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
        icon: achievement.icon,
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
      duration: 5000,
      position: position,
    });

    await toast.present();
  }

}
