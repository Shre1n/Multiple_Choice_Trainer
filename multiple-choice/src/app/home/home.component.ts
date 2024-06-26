import {Component, Input, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {GestureController, GestureDetail, IonicModule, NavController} from "@ionic/angular";
import {addIcons} from "ionicons";
import { personOutline, logOutOutline, calculatorOutline, schoolOutline, codeSlashOutline } from 'ionicons/icons';
import {AuthService} from "../services/auth.service";
import {ModuleService} from "../services/module.service";
import {AlertController, ToastController} from "@ionic/angular/standalone";
import {NgStyle} from "@angular/common";
import {ModuleModule} from "../module/module.module";
import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule,
    NgStyle,
    FooterComponent
  ],
  standalone: true
})
export class HomeComponent implements OnInit{

  isLoggedIn!:boolean;
  modules: any[] = [];
  errorMessage: string = 'No Connection to External Server! :cry:';
  categories: string[] = [];


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,
              private gestureCtrl: GestureController,
              private moduleService: ModuleService,
              private toastController: ToastController,
              private alertController: AlertController) {
    addIcons({ personOutline, logOutOutline, calculatorOutline, schoolOutline, codeSlashOutline });
    this.isLoggedIn = this.isAuth();
  }

  ngOnInit() {
    this.initializeSwipeGesture();
    this.checkLoginStatus();
    this.loadModules();
    this.checkForUpdates();
  }

  navigateToCardDetail() {
    this.router.navigate(['/card-detail']);
  }


  async presentToast(position: 'middle') {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }

  async navSession(category: string) {
    if (this.isLoggedIn) {
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



  checkForUpdates(): void {
    this.moduleService.checkForUpdates().subscribe(
      (response) => {
        if (response.updatesAvailable) {
          console.log('Updates available, reloading modules...');
        } else {
          console.log('No updates available');
        }
      },
      (error) => {
        console.error('Error checking for updates:', error);
      }
    );
  }

  async loadModules(){
    this.moduleService.loadExternalModule().subscribe(
      response => {
        console.log('Modules loaded:', response);
        this.modules = response;
        this.extractCategories(response);
      },
      error => {
        console.error('Error loading modules:', error);
        this.presentToast('middle');
      }
    );
  }

  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category);
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Mathematics': 'calculator-outline',
      'TypeScript': 'code-slash-outline',
      // Füge hier weitere Kategorien und entsprechende Icons hinzu
    };
    return icons[category] || 'help-outline'; // Standardicon, wenn keine Kategorie übereinstimmt
  }

  getCategoryBackground(category: string): string {
    const backgrounds: { [key: string]: string } = {
      'Mathematics': '#2D496B',
      'TypeScript': '#5A7699',
      // Füge hier weitere Kategorien und entsprechende Hintergründe hinzu
    };
    return backgrounds[category] || 'var(--ion-color-light)'; // Standardhintergrund, wenn keine Kategorie übereinstimmt
  }


  ionViewDidEnter(){
    this.authService.getCurrentUser()
    this.isLoggedIn = this.authService.isAuth();
  }


  isAuth(): boolean{
    return this.authService.isAuth();
  }

  checkLoginStatus() {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = user !== null;
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedIn = false;
    await this.navCtrl.navigateRoot(['/landingpage']);
  }

  openLoginForm(): void {
    this.router.navigate(['/login']);
    this.navCtrl.pop();
  }

  //Gesture to navigate to neighbor site from footer
  initializeSwipeGesture() {
    const content = document.querySelector('ion-content');
    if (content) {
      const gesture = this.gestureCtrl.create({
        el: content as HTMLElement,
        gestureName: 'swipe',
        onMove: ev => this.onSwipe(ev)
      });
      gesture.enable();
    } else {
      console.error('Ion content not found');
    }
  }

  onSwipe(ev: GestureDetail) {
    const deltaX = ev.deltaX;
    if (deltaX < -50) {
      this.router.navigate(['/statistik']);
    }
  }


}
