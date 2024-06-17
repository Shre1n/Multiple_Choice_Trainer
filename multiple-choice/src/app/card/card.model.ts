export class Card {

  question: string;
  answers: string[] = [];
  phase: number = 0;


  constructor(question: string, answers: string[], phase: number) {
    this.question = question;
    this.answers = answers;
    this.phase = phase;
  }

}
