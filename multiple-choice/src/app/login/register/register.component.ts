import {Component, NgModule} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {ToastController} from "@ionic/angular/standalone";

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
export class RegisterComponent{

  email: string = '';
  password: string = '';
  additionalData: any = { name: '', otherData: '' };
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

  async register() {
    if (!this.email || !this.password || !this.additionalData.name) {
      if (!this.email) {
        this.setOpen(false);
      }
      if (!this.password) {
        this.setOpen(false);
      }
      if (!this.additionalData.name) {
        this.setOpen(false);
      }
      return;
    }
    try {
      const user = await this.authService.register(this.email, this.password, this.additionalData);
      this.router.navigate(['/home']);
      this.setOpen(true);
      this.presentToast('middle');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      }
    }
  }
}
