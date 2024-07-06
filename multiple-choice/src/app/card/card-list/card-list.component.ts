import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {GestureDetail, IonicModule, NavController} from "@ionic/angular";
import {Router} from "@angular/router";
import {ModuleService} from "../../services/module.service";
import {AuthService} from "../../services/auth.service";
import {AlertController, IonSearchbar, ToastController} from "@ionic/angular/standalone";
import {FooterComponent} from "../../footer/footer.component";
import {addIcons} from "ionicons";
import {addCircleSharp, shareSocialOutline, searchOutline, logOutOutline} from "ionicons/icons";
import {Share} from '@capacitor/share';
import {FormsModule} from "@angular/forms";
import {AchievementsService} from "../../services/achievements.service";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  imports: [
    IonicModule,
    FooterComponent,
    FormsModule
  ],
  standalone: true
})
export class CardListComponent  implements OnInit {

  isLoggedIn!: boolean;
  savedModules: any[] = [];
  userSessions: any[] = [];
  showSearchBar: boolean = false;
  searchText: string = "";
  filterUsermodule: any[] = [];

  categories: string[] = [];


  @ViewChild('searchbar') searchbar!: IonSearchbar;

  constructor(private router:Router,
              public navCtrl: NavController,
              private moduleService: ModuleService,
              private authService: AuthService,
              private alertController: AlertController,
              private toastController: ToastController,
              private achievements: AchievementsService,
              ) {
    addIcons({addCircleSharp,shareSocialOutline,searchOutline,logOutOutline});
  }

  async ngOnInit() {
    this.fetchSessionSavedModules();
    await this.moduleService.checkForSessions();
  }

  search() {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      setTimeout(() => {
        this.searchbar.setFocus();
      }, 100);
    }
  }

  closeSearch() {
    this.searchText = '';
    this.filterModule();
  }

  clear() {
    this.searchText = "";
    this.filterUsermodule = [...this.savedModules]
  }

  filterModule() {
    if (this.searchText.trim() === '') {
      this.filterUsermodule = [...this.savedModules]
    } else {
      this.filterUsermodule = this.savedModules.filter(module =>
        module.category.toLowerCase().includes(this.searchText.toLowerCase())
      );
      this.filterUsermodule = [...this.filterUsermodule]
      console.log(this.filterUsermodule)
    }
  }

  async presentToast(message: string, position: 'middle') {
    const toast = await this.toastController.create({
      message: message,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }

  async loadModules() {
    this.moduleService.loadExternalModule().subscribe(
      response => {
       this.extractCategories(response);
      },
      error => {
        console.error('Error loading modules:', error);
        this.presentToast('No Connection to External Server! :(', 'middle');
      }
    );
  }

  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category);
  }

  async loadAndSortUserSessions() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      try {
        this.userSessions = await this.moduleService.getUserSessions(user.uid);
        await this.moduleService.sortModulesByLastStudied(this.userSessions);
      } catch (error) {
        console.error('Error loading and sorting user sessions:', error);
      }
    } else {
      console.error('No user is logged in');
    }
  }

  shareLearnedModules() {
    let msgText = "Hallo, \ndas sind meine Angefangenen Module:\n";

    msgText += "Kategorien:\n"
    this.savedModules.forEach(mod => {
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

  async fetchSessionSavedModules() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      try {
        this.savedModules = await this.moduleService.getSavedSessionModulesForUser(user.uid);
      } catch (error) {
        console.error('Error fetching saved modules:', error);
      }
    } else {
      console.error('No user is logged in');
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

  async startRandomSession() {
    await this.loadModules();
    if (this.savedModules.length === 0) {
      const randomIndex = Math.floor(Math.random() * this.categories.length);
      const randomCategory = this.categories[randomIndex];
      await this.navSession(randomCategory);
    }

  }

  ionViewDidEnter(){
    this.fetchSessionSavedModules();
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

}

