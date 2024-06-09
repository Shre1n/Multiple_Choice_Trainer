import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class ForgetPasswordComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
