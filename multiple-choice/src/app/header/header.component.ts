import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {personOutline} from "ionicons/icons";
import {addIcons} from "ionicons";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class HeaderComponent  implements OnInit {

  @Output() openRegisterForm: EventEmitter<void> = new EventEmitter<void>();

  constructor() {
    addIcons({personOutline});
  }

  ngOnInit() {}

  emitOpenRegisterForm(): void {
    this.openRegisterForm.emit();
  }

}
