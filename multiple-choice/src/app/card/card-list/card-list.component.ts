import { Component, OnInit } from '@angular/core';
import {GestureDetail, IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {ModuleService} from "../../services/module.service";
import {AuthService} from "../../services/auth.service";
import {AlertController} from "@ionic/angular/standalone";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class CardListComponent  implements OnInit {

  savedModules: any[] = [];

  constructor(private router:Router,
              private moduleService: ModuleService,
              private authService: AuthService,
              private alertController: AlertController) {
  }

  async ngOnInit() {
    this.fetchSavedModules();
  }

  async fetchSavedModules() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.moduleService.getSavedModulesForUser(user.uid).then(savedModules => {
        this.savedModules = savedModules;
      }).catch(error => {
        console.error('Error fetching saved modules:', error);
      });
    }
  }

  async navSession(category: string) {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/session', { category: category }]);
    } else {
      console.error('No user is logged in');
    }
  }

  onSwipe(ev: GestureDetail) {
    const deltaX = ev.deltaX;
    if (deltaX < -50) {
      this.router.navigate(['/statistik']);
    }else {
      if (deltaX < 50) {
        this.router.navigate(['/achivements'])
      }
    }
  }
}

