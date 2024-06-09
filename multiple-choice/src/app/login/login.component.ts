import { Component} from '@angular/core';
import { AuthService } from '../services/auth.service'
import {Router} from "@angular/router";
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";

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

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      const user = await this.authService.login(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    }
  }

  openRegisterForm(): void {
    this.router.navigate(['/register']);
  }

}
