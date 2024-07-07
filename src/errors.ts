import { Token } from "./token";

abstract class LinError {
  public message: string;

  constructor(message: string) {
    this.message = message;
  }

  public report() {
    // Report the error
  }
}

export class LinSyntaxError extends LinError {
  private line: number;
  private column: number;

  public constructor(line: number, column: number, message: string) {
    super(message);
    this.line = line;
    this.column = column;
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

  public reportAndThrow() {
    for (const error of this.errors) {
      error.report();
    }
    throw this;
  }

  public push(error: LinError) {
    this.errors.push(error);
  }

  public isEmpty() {
    return this.errors.length === 0;
  }
}
