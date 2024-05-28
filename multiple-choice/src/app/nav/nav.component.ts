import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class NavComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
