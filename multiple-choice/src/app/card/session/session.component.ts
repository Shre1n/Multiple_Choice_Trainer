import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ModuleService} from "../../services/module.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  imports: [IonicModule],standalone:true
})
export class SessionComponent  implements OnInit {

  categories: string[] = [];

  constructor(private moduleService: ModuleService,private router: Router,) { }

  ngOnInit() {

  }


  extractCategories(modules: any): void {
    this.categories = Object.keys(modules).map(key => modules[key].category);
  }

}


