import { Component, OnInit } from '@angular/core';
import {IonicModule, NavController} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {FooterComponent} from "../footer/footer.component";
import {addIcons} from "ionicons";
import {logOutOutline} from 'ionicons/icons';
import {AuthService} from "../services/auth.service";
import {AchievementsService} from "../services/achievements.service";

@Component({
  selector: 'app-statistik',
  templateUrl: './statistik.component.html',
  styleUrls: ['./statistik.component.scss'],
  imports: [
    IonicModule,
    FooterComponent
  ],
  standalone: true
})
export class StatistikComponent implements OnInit{

  //wichtig
  isLoggedIn!: boolean;
  wrongAnswers: number = 0;
  kartenInsgesammt: number = 10;
  kartenRichtig: number = 10;
  prozErfolg: number = 0;

  constructor(private router: Router,
              private route: ActivatedRoute,
              public navCtrl: NavController,
              private authService: AuthService,
              private achievements: AchievementsService,
              ) {
    addIcons({logOutOutline})
    this.isLoggedIn = this.isAuth();

  }

  ngOnInit() {
    this.wrongAnswers = +this.route.snapshot.paramMap.get('wrongAnswers')!;  }


  isAuth(): boolean {
    return this.authService.isAuth();
  }

  async logout() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 7);
    }
    await this.authService.logout();
    this.isLoggedIn = false;
    await this.navCtrl.navigateRoot(['/landingpage']);
  }

  goToHome() {
    this.router.navigate(['/card-list']);
  }
}
