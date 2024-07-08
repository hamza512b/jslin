import { LinRuntimeError } from "./errors";

export class Environment {
  enclosing: Environment | null = null;
  values: Map<string, any> = new Map();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing || null;
  }

  add(name: string, value: any) {
    if (this.values.has(name)) {
      throw new LinRuntimeError("'" + name + "' already defined.");
    }
    this.values.set(name, value);
  }

  get(name: string): any {
    if (this.values.has(name)) {
      return this.values.get(name);
    }

    if (this.enclosing != null) return this.enclosing.get(name);

    throw new LinRuntimeError("Undefined variable '" + name + "'.");
  }

  set(name: string, value: any) {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }

    if (this.enclosing != null) {
      this.enclosing.set(name, value);
      return;
    }

    throw new LinRuntimeError("Undefined variable '" + name + "'.");
  }
}
