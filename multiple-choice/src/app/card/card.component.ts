import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ModuleService} from "../services/module.service";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [
    IonicModule
  ],
  standalone: true
})
export class CardComponent implements OnInit{

  constructor(private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.loadModules();
  }

  loadModules(): void {
    // Laden von externen Modulen
    const moduleName = 'module1'; // Êxample
    this.moduleService.loadLocalModule(moduleName).subscribe(
      response => {
        console.log('Local Module:', response);
      },
      error => {
        console.error('Error loading local module:', error);
      }
    );
  }


}
