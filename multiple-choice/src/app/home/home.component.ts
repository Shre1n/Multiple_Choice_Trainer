import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {IonicModule, NavController} from "@ionic/angular";
import {addIcons} from "ionicons";
import {personOutline,logOutOutline} from "ionicons/icons";
import {AuthService} from "../services/auth.service";
import {ModuleService} from "../services/module.service";
import {ToastController} from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class HomeComponent implements OnInit{

  isLoggedIn: boolean = false;
  modules: any[] = [];
  errorMessage: string = 'No Connection to External Server! 😢';


  constructor(private router: Router,
              public navCtrl: NavController,
              private authService: AuthService,
              private moduleService: ModuleService,
              private toastController: ToastController) {
    addIcons({personOutline, logOutOutline});
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

  loadModules(): void {
    this.moduleService.loadExternalModule().subscribe(
      response => {
        console.log('Modules loaded:', response);
        this.modules = response;
      },
      error => {
        console.error('Error loading modules:', error);
        this.presentToast('middle');
      }
    );
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


}
