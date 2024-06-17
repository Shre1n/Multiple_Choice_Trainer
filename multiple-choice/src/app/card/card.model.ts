export class Card {

  question: string;
  answers: string[] = [];
  phase: number = 0;
  repeatDate: number = 20240614;//(yyyymmdd) so kann man später nas datum nach größe sortieren
  // und carten welche wieder zu absolvieren sind, sind alle mit der Zahl datumHeute und kleiner


  constructor(question: string, answers: string[], repeatDate: number) {
    this.question = question;
    this.answers = answers;
    this.repeatDate = repeatDate;//today
  }

}
