import {Component, OnInit, ViewChild} from '@angular/core';
import {IonicModule, IonInput, NavController} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {ToastController} from "@ionic/angular/standalone";
import {addIcons} from "ionicons";
import {close} from "ionicons/icons";

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

  #IonInput: IonInput | undefined;
  @ViewChild( IonInput)
  set searchbar(II: IonInput) {
    if (II) {
      II.setFocus();
      this.#IonInput = II;
    }
    setTimeout(() => II.setFocus(), 1);
  }

  constructor(private authService: AuthService, private router: Router, private toastController: ToastController, private navController: NavController) {
    addIcons({close})
  }

  //Lifecycle Method
  ngOnInit() {
    this.resetForm();
  }

  // reset Form
  resetForm() {
    this.email = '';
    this.errorMessage = '';
    this.isToastOpen = false;
  }

  // Set open toast
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  // Present Toast
  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: color,
      position: 'middle',
    });
    await toast.present();
  }

  // Email Check in Firestore to reset password
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
      await this.presentToast(this.successMessage, 'success');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = `Password reset failed: ${error.message}`;
      } else {
        this.errorMessage = 'An unknown error occurred during password reset.';
      }
      await this.presentToast(this.errorMessage, 'danger');
      this.navController.pop();
    }
  }


}
