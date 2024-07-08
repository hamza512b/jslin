import { LinCallable } from "./callable";
import { Environment } from "./environment";
import Interpreter from "./interpreter";

export class PrintCommand extends LinCallable {
  private stringify(object: any) {
    if (object == null) return "none";
    if (typeof object === "number") {
      let text = object.toString();
      if (text.endsWith(".0")) {
        text = text.substring(0, text.length - 2);
      }
      return text;
    }
    return object.toString();
  }

  call(interpreter: Interpreter, args: any[]): any {
    console.log(args.map((arg) => this.stringify(arg)).join(" "));
    return null;
  }

  arity() {
    return -1;
  }

  toString() {
    return "<native command>";
  }
}
export class ClearCommand extends LinCallable {
  call(interpreter: Interpreter, args: any[]): any {
    console.log("\x1b[H\x1b[2J");
    return null;
  }

  arity() {
    return 0;
  }

  toString() {
    return "<native command>";
  }
}

export class ClockCommand extends LinCallable {
  arity() {
    return 0;
  }

  call(interpreter: Interpreter, args: any[]) {
    return new Date().getTime();
  }

  toString() {
    return "<native command>";
  }
}

export const standardState = new Environment();

standardState.add("PRINT", new PrintCommand());
standardState.add("CLEAR", new ClearCommand());
standardState.add("CLOCK", new ClockCommand());
