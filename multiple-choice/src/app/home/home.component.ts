import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NavComponent} from "../nav/nav.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    NavComponent
  ],
  standalone: true
})
export class HomeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
