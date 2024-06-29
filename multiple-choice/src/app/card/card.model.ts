export class Card {

  question: string;
  answers: string[] = [];
  phase: number = 0;


  constructor(question: string, answers: string[]) {
    this.question = question;
    this.answers = answers;
  }

}

