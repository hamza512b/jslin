import { formatTokenType, TokenType } from "./tokenType";

export class Token {
  public type: TokenType;
  public lexeme: string;
  public literal: Object;
  public line: number;
  public column: number;

  public constructor(
    type: TokenType,
    lexeme: string,
    literal: any,
    line: number,
    column: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
    this.column = column;
  }
}
