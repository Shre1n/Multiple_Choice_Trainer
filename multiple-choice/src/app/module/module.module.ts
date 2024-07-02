export class ModuleModule {
  id: number;
  category: string;
  name: string;
  description: string;
  correctStreak: number;

  constructor(
    id: number,
    category: string,
    name: string,
    description: string,
    correctStreak: number
  ) {
    this.id = id;
    this.category = category;
    this.name = name;
    this.description = description;
    this.correctStreak = correctStreak;

  }
}
