import { Component, OnInit } from '@angular/core';
import {GestureDetail, IonicModule} from "@ionic/angular";
import {Router} from "@angular/router";
import {ModuleService} from "../../services/module.service";
import {AuthService} from "../../services/auth.service";
import {AlertController, ToastController} from "@ionic/angular/standalone";
import {FooterComponent} from "../../footer/footer.component";
import {addIcons} from "ionicons";
import {addCircleSharp} from "ionicons/icons";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  imports: [
    IonicModule,
    FooterComponent
  ],
  standalone: true
})
export class CardListComponent  implements OnInit {

  savedModules: any[] = [];

  constructor(private router:Router,
              private moduleService: ModuleService,
              private authService: AuthService,
              private alertController: AlertController,
              private toastController: ToastController,) {
    addIcons({addCircleSharp});
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
      const alert = await this.alertController.create({
        header: 'Start Session',
        message: 'Möchten Sie die Lernsession jetzt starten?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          },
          {
            text: 'Start',
            handler: () => {
              this.router.navigate(['/session', {category: category}]);
            }
          }
        ]
      });

      await alert.present();
    } else {
      const toast = await this.toastController.create({
        message: 'Bitte melde dich an, um eine Lernsession zu starten!',
        duration: 2000,
        position: 'top'
      });
      toast.present();
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

  navigateToCardDetail() {
    this.router.navigate(['/card-detail']);
  }



}

