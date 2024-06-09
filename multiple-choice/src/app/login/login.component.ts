import { Component} from '@angular/core';
import { AuthService } from '../services/auth.service'
import {Router} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {ToastController} from "@ionic/angular/standalone";

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
export class LoginComponent{

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isToastOpen = false;

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController) {}

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
    try {
      const user = await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = `Login failed: No login found.`;
      } else {
        this.errorMessage = 'An unknown error occurred during login.';
      }
      this.setOpen(true);
      this.presentToast('middle');
    }
  }

  openRegisterForm(): void {
    this.router.navigate(['/register']);
  }

}
