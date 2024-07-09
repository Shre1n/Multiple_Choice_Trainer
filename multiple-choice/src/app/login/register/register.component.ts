import {Component, OnInit, ViewChild} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {IonicModule, IonInput, NavController} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular/standalone';
import { AchievementsService } from '../../services/achievements.service';
import {close} from "ionicons/icons";
import {addIcons} from "ionicons";

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

  passwordMinLength:number=6;
  nameMinLength:number=2;
  email: string = '';
  password: string = '';
  additionalData: any = { name: '', otherData: '' };
  errorMessage: string = '';
  isToastOpen = false;
  errors = new Map<string, string>();

  @ViewChild('name')
  private name!: IonInput;


  #IonInput: IonInput | undefined;
  @ViewChild( IonInput)
  set searchbar(II: IonInput) {
    if (II) {
      II.setFocus();
      this.#IonInput = II;
    }
    setTimeout(() => II.setFocus(), 1);
  }


  constructor(private authService: AuthService,
              private router: Router,
              private toastController: ToastController,
              private navController: NavController,
              private achievements: AchievementsService) {
    addIcons({close})
  }

  // Lifecycle Method to reset form if something went wrong
  ngOnInit() {
    this.resetForm();
  }

  // reset form
  resetForm() {
    this.email = '';
    this.password = '';
    this.additionalData.name = '';
    this.errorMessage = '';
    this.isToastOpen = false;
  }

  // set open to toast
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  // present Toast with Message
  async presentToast(message: string, duration: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
    });

    await toast.present();
  }

  // Method to pass a data to firestore
  async register() {
    if (!this.email || !this.password || !this.additionalData.name) {
      this.setOpen(false);
      return;
    }

    if (this.name.value!.toString().length < 2) {
      this.errors.set('name', 'Name muss mindestens 2 zeichen enthalten!');
    } else {
      this.errors.clear();
    }

    try {
      if(this.errors.size === 0) {
        const user = await this.authService.register(this.email, this.password, this.additionalData);
        await this.authService.login(this.email, this.password);
        await this.achievements.initAchivements(user.uid);
        await this.presentToast('Sie haben sich erfolgreich registriert!', 2000);
        await this.navController.navigateRoot(['/home']);
      }
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
      await this.presentToast(this.errorMessage, 5000);
    }
  }
}
