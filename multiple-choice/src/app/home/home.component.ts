import {Component,OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {IonicModule, NavController} from "@ionic/angular";
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
  trashSharp,
  searchOutline,
  telescopeOutline,
  addSharp
} from 'ionicons/icons';
import {AuthService} from "../services/auth.service";
import {ModuleService} from "../services/module.service";
import {AlertController, ToastController, IonSearchbar} from "@ionic/angular/standalone";
import {NgStyle} from "@angular/common";
import {FooterComponent} from "../footer/footer.component";
import {Share} from '@capacitor/share';
import {FormsModule} from "@angular/forms";
import {AchievementsService} from "../services/achievements.service";
import {interval} from "rxjs";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule,
    NgStyle,
    FooterComponent,
    FormsModule,
  ],
  standalone: true
})
export class HomeComponent implements OnInit {

  isLoggedIn!: boolean;
  modules: any[] = [];
  userModules: any[] = [];
  categories: string[] = [];
  showSearchBar: boolean = false;
  searchText: string = "";
  filterServermodule: string[] = [];
  filterUsermodule: string[] = [];

  // search text 'observer'
  @ViewChild('searchbar') searchbar!: IonSearchbar;

  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,
              private moduleService: ModuleService,
              private toastController: ToastController,
              private alertController: AlertController,
              private achievements: AchievementsService,) {
    addIcons({
      personOutline,
      shareSocialOutline,
      logOutOutline,
      calculatorOutline,
      addCircleSharp,
      schoolOutline,
      codeSlashOutline,
      pencilSharp,
      trashSharp,
      searchOutline,
      telescopeOutline,
      addSharp
    });
    this.isLoggedIn = this.isAuth();
  }

  // lifecycle Method
  ngOnInit() {
    this.checkLoginStatus();
    this.loadInitialData()
    this.checkForUpdates();
  }

  // Method to load Data
  async loadInitialData() {
    await this.loadModules();
    await this.loadUserModules();
  }


  //update card navigation
  updateModule(module: { category: string; }) {
    // Simplified with param passing
    this.router.navigate(['/card-detail'], {queryParams: {category: module, edit: 'true'}});
  }

  // present Delete
  async presentDeleteConfirm(module: { category: string; }) {
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

  // show searchbar to search things
  search() {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 100);
    }
  }

  // Method to close the searchbar
  closeSearch() {
    this.searchText = '';
    this.filterModule();
  }

  // Method to clear searchbar
  clear() {
    this.searchText = "";
    this.filterServermodule = [...this.categories];
    this.filterUsermodule = [...this.filterUsermodule]
  }

  // Method to filter searched Modules and render them after search change
  async filterModule() {
    if (this.searchText.trim() === '') {
      this.filterServermodule = [...this.categories];
      this.filterUsermodule = [...this.filterUsermodule]
    } else {
      this.filterServermodule = this.categories.filter(category =>
        category.toLowerCase().includes(this.searchText.toLowerCase())
      );
      this.filterUsermodule = this.userModules.filter(module =>
        module.toLowerCase().includes(this.searchText.toLowerCase())
      );
      this.filterServermodule = [...this.filterServermodule];
      this.filterUsermodule = [...this.filterUsermodule]
    }
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 9);
    }
  }

  // Method to delete a Module
  async deleteModule(module: { category: string; }) {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.moduleService.deleteUserModule(module).then(() => {
        this.presentToast('Modul erfolgreich gelöscht', 'middle');
        this.loadUserModules();  // Reload the modules after deletion
        this.achievements.setIndexAchievement(user.uid, 5);
      });
    }
  }

  // Method to share user Modules
  async shareMyModules() {
    let msgText = "Hallo, \ndas sind meine Module:\nKategorien:\n";

    this.userModules = await this.moduleService.renderUserCategories();
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 8);
    }

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

  //Method navigates to card-list
  navigateToCardDetail() {
    this.router.navigate(['/card-detail']);
  }

  //Loads all self made user Modules from firestore
  async loadUserModules() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const savedModules = await this.moduleService.renderUserCategories();
      if (savedModules) {
        this.userModules = savedModules;
      } else {
        this.userModules = []; // Fallback to empty array if savedModules is undefined
      }
    } else {
      this.userModules = []; // Fallback to empty array if user is not logged in
    }
  }

  // Present Toast Function
  async presentToast(message: string, position: 'middle') {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: position,
    });

    await toast.present();
  }

  // Navigation to Session from category with a alertController
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

  // checks for Update from External Server
  checkForUpdates(): void {
    this.moduleService.checkForUpdates().subscribe({
      next: response => {
        if (response.updatesAvailable) {
          console.log('Updates available, reloading modules...');
        } else {
          console.info('No updates available');
        }
      },
      error: error => {
        console.error('Error checking for updates:', error);
      }
    });
  }

  // Loads Modules from Server
  async loadModules() {
    this.moduleService.loadExternalModule().subscribe({
      next: response => {
        this.modules = response;
        this.extractCategories(response);
      },
      error: error => {
        console.error('Error loading modules:', error);
        this.presentToast('No Connection to External Server! :(', 'middle');
      }
    });
  }

  // Extract Category from server Modules
  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category).sort();
  }

  // Set Icon Method for Basic Modules
  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'Mathematics': 'calculator-outline',
      'TypeScript': 'code-slash-outline',
      'Science': 'telescope-outline'
      // More....
    };
    return icons[category] || 'help-outline'; // Standardicon, wenn keine Kategorie übereinstimmt
  }

  //Sets the Background color of Item/Card
  getCategoryBackground(index: number) {
    return index % 2 === 0 ? '#2D496B': '#5A7699';
  }

  // Loads on enter site to check Auth and load Data
  ionViewDidEnter() {
    this.authService.getCurrentUser()
    this.isLoggedIn = this.authService.isAuth();
    this.loadInitialData();
  }

  //checks Auth state of User
  isAuth(): boolean {
    return this.authService.isAuth();
  }

  // Check if user is logged in
  checkLoginStatus() {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = user !== null;
  }

  // logout User
  async logout() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      await this.achievements.setIndexAchievement(user.uid, 7);
    }
    await this.authService.logout();
    this.isLoggedIn = false;
    await this.navCtrl.navigateRoot(['/landingpage']);
  }


}
