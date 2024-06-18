import { Component, OnInit } from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {ModuleService} from "../../services/module.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  imports: [IonicModule, FormsModule, NgClass],standalone:true
})
export class SessionComponent  implements OnInit {

  category: string = '';
  modules: any[] = [];
  currentIndex: number = 0;
  showCorrectAnswers: boolean = false;
  selectedAnswer: string = '';

  constructor(private moduleService: ModuleService,private router: Router,private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.category = params['category']; // assuming category is passed as a parameter
      this.loadAllCategoryModules();
    });
  }

  loadAllCategoryModules() {
    this.moduleService.loadExternalModule().subscribe(data => {
      if (data && data[this.category] && data[this.category].modules) {
        this.modules = data[this.category].modules.map((module: any) => ({
          question: module.question,
          answers: module.answers,
          correctAnswer: module.correctAnswer,
          answeredCorrectlyCount: module.answeredCorrectlyCount,
          answeredIncorrectlyCount: module.answeredIncorrectlyCount
        }));
      } else {
        console.error('No modules found for this category:', this.category);
      }
    }, error => {
      console.error('Error loading modules:', error);
    });
  }

  checkAnswer() {
    this.showCorrectAnswers = true;
    const currentModule = this.modules[this.currentIndex];
    if (this.selectedAnswer === currentModule.correctAnswer) {
      currentModule.answeredCorrectlyCount++;
    } else {
      currentModule.answeredIncorrectlyCount++;
    }
  }

  nextQuestion() {
    this.showCorrectAnswers = false;
    this.selectedAnswer = '';
    if (this.currentIndex < this.modules.length - 1) {
      this.currentIndex++;
    } else {
      // Optional: Logik für das Ende der Fragen
      console.log('End of questions');
    }
  }




}


