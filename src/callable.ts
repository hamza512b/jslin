import { Environment } from "./environment";
import Interpreter from "./interpreter";
import { CmdDefinition } from "./nodes";

export abstract class LinCallable {
  abstract arity();

  abstract call(interpreter: Interpreter, args: any[]);
}
export class Return {
  value: any;
  public constructor(value: any) {
    this.value = value;
  }
}

export class LinFunction extends LinCallable {
  declaration: CmdDefinition | null;
  closure: Environment | null;

  constructor(declaration?: CmdDefinition, closure?: Environment) {
    super();
    this.closure = closure || null;
    this.declaration = declaration || null;
  }

  call(interpreter: Interpreter, args: any[]) {
    if (this.declaration == null || this.closure == null) {
      throw "Function not defined";
    }
    const data = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      data.add(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, data);
    } catch (returnValue) {
      if (returnValue instanceof Return) return returnValue.value;
    }

    return null;
  }

  public arity() {
    return this.declaration?.params.length || 0;
  }

  public toString() {
    return "<DEF " + this.declaration?.name.lexeme || "unknown" + ">";
  }
}
