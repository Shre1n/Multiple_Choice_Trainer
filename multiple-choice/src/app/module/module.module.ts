export class ModuleModule {
  id: number;
  category: string;
  name: string;
  description: string;

  constructor(
    id: number,
    category: string,
    name: string,
    description: string
  ) {
    this.id = id;
    this.category = category;
    this.name = name;
    this.description = description

  }
}
