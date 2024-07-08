import { Token } from "./token";

abstract class LinError {
  public message: string;

  constructor(message: string) {
    this.message = message;
  }

  public abstract report();
}

export class LinSyntaxError extends LinError {
  private line: number;
  private column: number;

  public constructor(line: number, column: number, message: string) {
    super(message);
    this.line = line;
    this.column = column;
  }

  public report() {
    console.log(this.getMessage());
  }

  static fromToken(token: Token, message: string): LinSyntaxError {
    return new LinSyntaxError(token.line, token.column, message);
  }

  public getMessage() {
    return (
      "SyntaxError at line " +
      this.line +
      " column " +
      this.column +
      ": " +
      this.message
    );
  }
}
export class LinErrorCollection extends LinError {
  private errors: LinError[];

  public constructor(errors: LinError[]) {
    super("Multiple rrors occurred");
    this.errors = errors;
  }

  public report() {
    for (const error of this.errors) {
      error.report();
    }
  }

  public reportAndThrow() {
    for (const error of this.errors) {
      if (error?.report) {
        error?.report?.();
      } else {
        console.log(error);
      }
    }
    throw "Compilation failed";
  }

  public push(error: LinError) {
    this.errors.push(error);
  }

  public isEmpty() {
    return this.errors.length === 0;
  }
}

export class LinRuntimeError extends LinError {
  constructor(message: string) {
    super(message);
  }

  public report() {
    console.log(this.getMessage());
  }

  public getMessage() {
    return "RuntimeError error: " + this.message;
  }

  public reportAndThrow() {
    console.log(this.getMessage());
    throw "Runtime error";
  }
}
