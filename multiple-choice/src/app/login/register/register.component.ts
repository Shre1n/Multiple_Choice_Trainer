import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';
import { AchievementsService } from '../../services/achievements.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class RegisterComponent implements OnInit {

  email: string = '';
  password: string = '';
  additionalData: any = { name: '', otherData: '' };
  errorMessage: string = '';
  isToastOpen = false;

  constructor(private authService: AuthService,
              private router: Router,
              private toastController: ToastController,
              private navController: NavController,
              private achievements: AchievementsService) {
  }

  clearPasswort(){
    this.password="";
  }

  clearName(){
    this.additionalData="";
  }

  clearEmail() {
    this.email="";
  }
  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.email = '';
    this.password = '';
    this.additionalData.name = '';
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

  async register() {
    if (!this.email || !this.password || !this.additionalData.name) {
      this.setOpen(false);
      return;
    }
    try {
      const user = await this.authService.register(this.email, this.password, this.additionalData);
      await this.authService.login(this.email, this.password);
      await this.achievements.initAchivements(user.uid);
      // MARKIERT: Zeige Erfolgsnachricht bei erfolgreicher Registrierung
      await this.presentToast('Sie haben sich erfolgreich registriert!', 2000);
      await this.navController.navigateRoot(['/home']);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if ((error as any).code === 'auth/email-already-in-use') {
          this.errorMessage = 'Diese E-Mail-Adresse wird bereits verwendet.';
        } else {
          this.errorMessage = (error as any).message;
        }
      } else if (error instanceof Error) {
        this.errorMessage = error.message;
      }
      this.setOpen(true);
      // MARKIERT: Zeige Fehlermeldung bei fehlgeschlagener Registrierung
      await this.presentToast(this.errorMessage, 5000);
    }
  }
}
