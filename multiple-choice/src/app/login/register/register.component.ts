import {Component, NgModule, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {IonicModule, NavController} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {ToastController} from "@ionic/angular/standalone";
import {AchievementsService} from "../../services/achievements.service";

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
              private achievements: AchievementsService) {}

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
      await this.achievements.initAchivements(user.uid);
      await this.authService.login(this.email, this.password);
      await this.navController.pop();
      await this.router.navigate(['/home']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      }
    }
  }
}
