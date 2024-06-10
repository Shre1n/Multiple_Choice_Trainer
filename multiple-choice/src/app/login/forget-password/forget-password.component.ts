import { Component, OnInit } from '@angular/core';
import {IonicModule, NavController} from "@ionic/angular";
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
export class ForgetPasswordComponent implements OnInit {
  email: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isToastOpen = false;

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController, private navController: NavController) {}

  ngOnInit() {
    this.resetForm();
  }
  resetForm() {
    this.email = '';
    this.errorMessage = '';
    this.isToastOpen = false;
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

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
    if (!this.email){
      if (!this.email) {
        this.setOpen(false);
      }
      return;
    }


    try {
      await this.authService.resetPassword(this.email);
      this.successMessage = 'Password reset email sent. Check your inbox.';
      this.presentToast(this.successMessage, 'success');
      await this.navController.pop();
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
