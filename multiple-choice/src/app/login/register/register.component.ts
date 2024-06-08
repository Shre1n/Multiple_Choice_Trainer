import { Component} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent{

  email: string = '';
  password: string = '';
  additionalData: any = { name: '', otherData: '' };
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  async register() {
    try {
      const user = await this.authService.register(this.email, this.password, this.additionalData);
      this.router.navigate(['/home']);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.errorMessage = error.message;
      }
    }
  }
}
