import {Component, OnInit} from '@angular/core';
import {IonicModule} from "@ionic/angular";
import {FormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {ModuleService} from "../../services/module.service";

interface Question {
  question: string;
  answers: string[];
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
  currentQuestion: Question = {question: '', answers: ['', '', '', '']};
  moduleData: { category: string, questions: Question[] } = {category: '', questions: []};

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
    this.moduleData.questions.push({ ...this.currentQuestion });
    this.currentQuestion = { question: '', answers: ['', '', '', ''] };
  }

  async cancel() {
    const user = await this.authService.getCurrentUser();
    this.moduleData.category = this.category;
    this.moduleData.questions.push({...this.currentQuestion});

    if (user) {
      await this.moduleService.saveModule(user.uid, this.moduleData);
    }

    // Navigate back to the card list
    this.router.navigate(['/card-list']);
  }
}
