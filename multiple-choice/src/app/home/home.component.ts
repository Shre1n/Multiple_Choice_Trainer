import {AfterViewInit, Component, Input, OnInit, ChangeDetectorRef, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {GestureController, GestureDetail, IonicModule, NavController, IonCard} from "@ionic/angular";
import {addIcons} from "ionicons";
import {
  personOutline,
  logOutOutline,
  shareSocialOutline,
  calculatorOutline,
  schoolOutline,
  addCircleSharp,
  codeSlashOutline,
  pencilSharp,
  trashSharp
} from 'ionicons/icons';
import {AuthService} from "../services/auth.service";
import {ModuleService} from "../services/module.service";
import {AlertController, ToastController} from "@ionic/angular/standalone";
import {NgStyle} from "@angular/common";
import {ModuleModule} from "../module/module.module";
import {FooterComponent} from "../footer/footer.component";
import {Share} from '@capacitor/share';

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
export class HomeComponent implements OnInit {

  isLoggedIn!: boolean;
  modules: any[] = [];
  userModules: any[] = [];
  categories: string[] = [];


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,
              private gestureCtrl: GestureController,
              private moduleService: ModuleService,
              private toastController: ToastController,
              private alertController: AlertController,
              private el: ElementRef,
              private cdRef: ChangeDetectorRef
  ) {
    addIcons({
      personOutline,
      shareSocialOutline,
      logOutOutline,
      calculatorOutline,
      addCircleSharp,
      schoolOutline,
      codeSlashOutline,
      pencilSharp,
      trashSharp
    });
    this.isLoggedIn = this.isAuth();
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.loadModules();
    this.loadUserModules();
    this.checkForUpdates();
  }



  updateModule(module: { category: any; }){

  }



  async presentDeleteConfirm(module: { category: any; }) {
    const alert = await this.alertController.create({
      header: 'Löschen',
      message: 'Möchten Sie dieses Modul wirklich löschen?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Löschen abgebrochen');
          }
        },
        {
          text: 'Löschen',
          handler: () => {
            this.deleteModule(module);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteModule(module: { category: any; }) {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.moduleService.deleteUserModule(module.category).then(() => {
        this.presentToast('Modul erfolgreich gelöscht', 'middle');
        this.loadUserModules();  // Reload the modules after deletion
      });
    }
  }

  async shareMyModules() {
    let msgText = "Hallo, \ndas sind meine Module:\nKategorien:\n";

    this.userModules = await this.moduleService.getSavedModulesForUser();

    this.userModules.forEach(mod => {
      msgText += `${mod.category}\n`;
    });

    Share.canShare().then(canShare => {
      if (canShare.value) {
        Share.share({
          title: 'Meine Angefangenen Module',
          text: msgText,
          dialogTitle: 'Module teilen'
        }).then((v) =>
          console.log('ok: ', v))
          .catch(err => console.log(err));
      } else {
        console.log('Error: Sharing not available!');
      }
    });
  }

  navigateToCardDetail() {
    this.router.navigate(['/card-detail']);
  }

  async loadUserModules() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const savedModules = await this.moduleService.getSavedModulesForUser();
      if (savedModules) {
        this.userModules = savedModules;
      } else {
        this.userModules = []; // Fallback to empty array if savedModules is undefined
      }
    } else {
      this.userModules = []; // Fallback to empty array if user is not logged in
    }
  }

  async addModule(module: any) {
    await this.moduleService.saveUserModulesToFirestore(module);
    this.loadUserModules();
  }


  async presentToast(message: string, position: 'middle') {
    const toast = await this.toastController.create({
      message: message,
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

  async loadModules() {
    this.moduleService.loadExternalModule().subscribe(
      response => {
        console.log('Modules loaded:', response);
        this.modules = response;
        this.extractCategories(response);
      },
      error => {
        console.error('Error loading modules:', error);
        this.presentToast('No Connection to External Server! :cry:', 'middle');
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


  ionViewDidEnter() {
    this.authService.getCurrentUser()
    this.isLoggedIn = this.authService.isAuth();
  }


  isAuth(): boolean {
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


}
