import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {ToastController} from "@ionic/angular/standalone";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class ForgetPasswordComponent  {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController) {}

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: color,
      position: 'middle',
    });
    await toast.present();
  }

  async resetPassword() {
    try {
      await this.authService.resetPassword(this.email);
      this.successMessage = 'Password reset email sent. Check your inbox.';
      this.router.navigate(['/login']);
      this.presentToast(this.successMessage, 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = `Password reset failed: ${error.message}`;
      } else {
        this.errorMessage = 'An unknown error occurred during password reset.';
      }
      this.presentToast(this.errorMessage, 'danger');

    }
  }


}
