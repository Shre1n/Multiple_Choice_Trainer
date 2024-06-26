import {Component, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ModuleService} from "../../services/module.service";

interface Question {
  question: string;
  answers: string[];
  correctAnswer: string;
  answeredCorrectlyCount: number;
  answeredIncorrectlyCount: number;
}

@Component({
  selector: 'app-card-detail',
  templateUrl: './card-detail.component.html',
  styleUrls: ['./card-detail.component.scss'],
  imports: [
    IonicModule,
    FormsModule
  ],
  standalone: true
})
export class CardDetailComponent {

  category: string = '';
  categoryAdded: boolean = false;
  currentQuestion: Question = {
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: '',
    answeredCorrectlyCount: 0,
    answeredIncorrectlyCount: 0
  };
  moduleData: { category: string, modules: Question[] } = { category: '', modules: [] };
  constructor(private router: Router,
              private authService: AuthService,
              private moduleService: ModuleService) {
  }

  addCategory() {
    this.moduleData.category = this.category;
    this.categoryAdded = true;
  }

  addAnswerField() {
    if (this.currentQuestion.answers.length < 6) {
      this.currentQuestion.answers.push('');
    }
  }

  async saveModule() {
    this.moduleData.modules.push({ ...this.currentQuestion });
    this.currentQuestion = {
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: '',
      answeredCorrectlyCount: 0,
      answeredIncorrectlyCount: 0
    };
    if (!this.categoryAdded) {
      this.categoryAdded = true;  // Make category readonly after first question is saved
    }

  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  async cancel() {
    const user = await this.authService.getCurrentUser();
    await this.moduleService.saveModule(this.moduleData);
    this.router.navigate(['/card-list']);


    // Navigate back to the card list
    this.router.navigate(['/card-list']);
  }
}
