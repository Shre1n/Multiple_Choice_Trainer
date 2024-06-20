import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../services/auth.service'
import {Router} from "@angular/router";
import {IonicModule, NavController} from "@ionic/angular";
import {FormsModule, NgForm} from "@angular/forms";
import {ToastController} from "@ionic/angular/standalone";
import {AchievementsService} from "../services/achievements.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class LoginComponent implements OnInit{

  @ViewChild('loginForm') loginForm!: NgForm;

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isToastOpen = false;

  constructor(private authService: AuthService,
              private router: Router,
              private toastController: ToastController,
              private navCtrl: NavController,
              private achievements: AchievementsService) {
  }

  ngOnInit() {
    this.resetForm();
  }
  resetForm() {
    if (this.loginForm) {
      this.loginForm.reset();
    }
    this.email = '';
    this.password = '';
    this.errorMessage = '';
    this.isToastOpen = false;
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  async presentToast(position: 'middle') {
    const toast = await this.toastController.create({
      message: this.errorMessage,
      duration: 5000,
      position: position,
    });

    await toast.present();
  }

  async login() {
    if (!this.email || !this.password) {
      if (!this.email) {
        this.setOpen(false);
      }
      if (!this.password) {
        this.setOpen(false);
      }
      return;
    }

    try {
      const user = await this.authService.login(this.email, this.password);
      await this.achievements.setIndexAchievement(user.uid, 1);
      await this.navCtrl.pop();
      await this.navCtrl.navigateRoot(['/home']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = `Login failed: No login found.`;
      } else {
        this.errorMessage = 'An unknown error occurred during login.';
      }
      this.setOpen(true);
      await this.presentToast('middle');
    }
  }

  openForgotPassword(): void{
    this.resetForm();
    this.navCtrl.pop();
    this.router.navigate(['/forget-password'])
  }

}
