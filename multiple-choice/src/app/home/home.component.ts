import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {IonicModule, NavController} from "@ionic/angular";
import {addIcons} from "ionicons";
import { personOutline, logOutOutline, calculatorOutline, schoolOutline, codeSlashOutline } from 'ionicons/icons';
import {AuthService} from "../services/auth.service";
import {ModuleService} from "../services/module.service";
import {ToastController} from "@ionic/angular/standalone";
import {NgStyle} from "@angular/common";
import {ModuleModule} from "../module/module.module";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule,
    NgStyle
  ],
  standalone: true
})
export class HomeComponent implements OnInit{

  isLoggedIn: boolean = false;
  modules: any[] = [];
  module: ModuleModule[]= [];
  errorMessage: string = 'No Connection to External Server! 😢';

  categories: string[] = [];


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,
              private moduleService: ModuleService,
              private toastController: ToastController) {
    addIcons({ personOutline, logOutOutline, calculatorOutline, schoolOutline, codeSlashOutline });
  }

  async presentToast(position: 'middle') {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 10000,
      position: position,
    });

    await toast.present();
  }

  ngOnInit() {
    this.checkLoginStatus();
    this.loadModules();
    this.checkForUpdates();
  }

  async loadModules(){
    this.module = await this.moduleService.findAll();
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
      'Mathematics': 'var(--ion-color-primary)',
      'TypeScript': 'var(--ion-color-info)',
      // Füge hier weitere Kategorien und entsprechende Hintergründe hinzu
    };
    return backgrounds[category] || 'var(--ion-color-light)'; // Standardhintergrund, wenn keine Kategorie übereinstimmt
  }



  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category);
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


  checkLoginStatus() {
    const user = this.authService.getCurrentUser();
    this.isLoggedIn = user !== null;
    console.log(this.isLoggedIn)
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedIn = false;
    await this.navCtrl.navigateRoot(['/home']);
  }

  openLoginForm(): void {
    this.router.navigate(['/login']);
    this.navCtrl.pop();
  }


  protected readonly ModuleService = ModuleService;
  protected readonly ModuleModule = ModuleModule;
}
