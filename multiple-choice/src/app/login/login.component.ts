import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';
import { AchievementsService } from '../services/achievements.service';

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
export class LoginComponent implements OnInit {

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

  // MARKIERT: Geänderte Methode, um benutzerdefinierte Nachrichten zu akzeptieren
  async presentToast(message: string, duration: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
    });

    await toast.present();
  }

  async login() {
    if (!this.email || !this.password) {
      this.setOpen(false);
      return;
    }

    try {
      const user = await this.authService.login(this.email, this.password);
      await this.achievements.setIndexAchievement(user.uid, 1);
      // MARKIERT: Zeige Erfolgsnachricht bei erfolgreichem Login
      await this.presentToast('Sie haben sich erfolgreich eingeloggt!', 2000);
      await this.navCtrl.navigateRoot(['/home']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = 'Login failed: No login found.';
      } else {
        this.errorMessage = 'An unknown error occurred during login.';
      }
      this.setOpen(true);
      // MARKIERT: Zeige Fehlermeldung bei fehlgeschlagenem Login
      await this.presentToast(this.errorMessage, 5000);
    }
  }

  openForgotPassword(): void {
    this.resetForm();
    this.navCtrl.pop();
    this.router.navigate(['/forget-password']);
  }

}
