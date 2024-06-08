import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class CardListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
