import { Component} from '@angular/core';
import { AuthService } from '../services/auth.service'
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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

}
