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

  modules: any[] = [];

  constructor(private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.loadModules(); // Beispiel: Laden des Mathematik-Moduls
  }

  loadModules(): void {
    this.moduleService.loadExternalModule().subscribe(
      response => {
        console.log('Modules loaded:', response);
        this.modules = response;
      },
      error => {
        console.error('Error loading modules:', error);
      }
    );
  }


}
