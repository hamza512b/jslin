import { LinErrorCollection, LinSyntaxError } from "./errors";
import {
  Cmd,
  CmdBody,
  CmdCondition,
  CmdDefinition,
  CmdExpression,
  CmdInit,
  CmdLoop,
  CmdReturn,
  CmdSet,
  Expr,
  ExprBinary,
  ExprCall,
  ExprComparison,
  ExprGrouping,
  ExprLiteral,
  ExprTernary,
  ExprUnary,
  ExprVariable,
} from "./nodes";
import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Parser {
  private errors = new LinErrorCollection([]);
  private tokens: Token[];
  private current = 0;

  public constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Cmd[] {
    const cmds: Cmd[] = [];
    while (!this.isAtEnd()) {
      const cmd = this.command();
      if (cmd) cmds.push(cmd);
    }

    if (!this.errors.isEmpty()) {
      this.errors.reportAndThrow();
    }

    return cmds;
  }

  private command() {
    try {
      const declaration = this.commandDeclaration();

      this.skipNewlines();

      return declaration;
    } catch (error: any) {
      this.errors.push(error);
      this.synchronize();
      return null;
    }
  }

  private skipNewlines() {
    while (this.match(TokenType.NEWLINE) && !this.isAtEnd());
  }

  private commandDeclaration() {
    if (this.match(TokenType.INIT)) return this.initCommand();
    if (this.match(TokenType.SET)) return this.setCommand();
    if (this.match(TokenType.RETURN)) return this.returnCommand();
    if (this.match(TokenType.DEF)) return this.defCommand();
    if (this.match(TokenType.IF)) return this.ifCommand();
    if (this.match(TokenType.WHILE)) return this.whileCommand();
    if (this.match(TokenType.COMMAND)) return this.callCommand();
    return this.expressionCommand();
  }

  private ifCommand(): Cmd {
    const condition = this.expression();
    this.consume(TokenType.NEWLINE, "Expect newline after condition.");
    const thenBranch = this.blockCommand();

    let elseBranch: CmdBody | null = null;

    if (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.IF)) {
        this.consume(TokenType.NEWLINE, "Expect newline after else if.");
        elseBranch = new CmdBody([this.ifCommand()]);
      } else {
        this.consume(TokenType.NEWLINE, "Expect newline after else.");
        elseBranch = this.blockCommand();
      }
    }

    return new CmdCondition(condition, thenBranch, elseBranch);
  }

  private whileCommand(): Cmd {
    const condition = this.expression();
    this.consume(TokenType.NEWLINE, "Expect newline after condition.");
    const body = this.blockCommand();
    return new CmdLoop(condition, body);
  }

  private defCommand(): Cmd {
    const name = this.consume(TokenType.COMMAND, "Expect function name.");

    const parameters: Token[] = [];
    while (this.match(TokenType.IDENTIFIER)) {
      parameters.push(this.previous());
    }

    this.consume(TokenType.NEWLINE, "Expect newline after parameters.");

    const body = this.blockCommand();

    return new CmdDefinition(name, parameters, body);
  }

  private blockCommand(): CmdBody {
    this.consume(TokenType.INDENT, "Expect block to start.");
    const cmds: Cmd[] = [];
    while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
      const cmd = this.command();
      if (cmd) cmds.push(cmd);
    }

    if (!this.isAtEnd()) {
      this.consume(TokenType.DEDENT, "Expect block to end.");
    }
    return new CmdBody(cmds);
  }

  private returnCommand(): Cmd {
    const value = this.expression();
    return new CmdReturn(value);
  }

  private call(): Expr {
    const command = this.previous();
    const args: Expr[] = [];

    while (!this.check(TokenType.RIGHT_PAREN) && !this.isAtEnd()) {
      args.push(this.expression());
    }

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

    return new ExprCall(command, args);
  }

  private callCommand(): Cmd {
    const command = this.previous();
    const args: Expr[] = [];
    while (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      args.push(this.expression());
    }

    return new CmdExpression(new ExprCall(command, args));
  }

  private initCommand(): Cmd {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
    const value = this.expression();
    if (!this.isAtEnd()) {
      this.consume(TokenType.NEWLINE, "Expect newline after expression.");
    }
    return new CmdInit(name, value);
  }

  private setCommand(): Cmd {
    const name = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
    const value = this.expression();
    if (!this.isAtEnd()) {
      this.consume(TokenType.NEWLINE, "Expect newline after expression.");
    }
    return new CmdSet(name, value);
  }

  private expressionCommand(): Cmd {
    const expr = this.expression();
    if (!this.check(TokenType.EOF)) {
      this.consume(TokenType.NEWLINE, "Expect newline after expression.");
    }
    return new CmdExpression(expr);
  }

  private expression(): Expr {
    let expr = this.disjunction();

    if (this.match(TokenType.IF_I)) {
      const condition = this.expression();
      this.consume(TokenType.ELSE_I, "Expect else.");
      const value = this.expression();
      expr = new ExprTernary(expr, condition, value);
    }

    return expr;
  }

  private disjunction(): Expr {
    let expr = this.conjunction();

    while (this.match(TokenType.OR)) {
      const operators = [this.previous()];
      const right = this.conjunction();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private conjunction(): Expr {
    let expr = this.inversion();

    while (this.match(TokenType.AND)) {
      const operators = [this.previous()];
      const right = this.inversion();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private inversion(): Expr {
    if (this.match(TokenType.NOT)) {
      return new ExprUnary(this.previous(), this.inversion());
    } else {
      return this.comparison();
    }
  }

  private comparison(): Expr {
    const comparisons: ExprBinary[] = [];
    let left = this.orExpr();

    while (
      this.match(
        TokenType.EQUAL_EQUAL,
        TokenType.BANG_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.IS,
        TokenType.NOT,
        TokenType.IN
      )
    ) {
      const operators: Token[] = [];
      const firstOperator = this.previous();
      operators.push(firstOperator);
      if (firstOperator.type == TokenType.IS) {
        if (this.match(TokenType.NOT)) {
          operators.push(this.previous());
        }
      } else if (firstOperator.type == TokenType.NOT) {
        if (this.match(TokenType.IN)) {
          operators.push(this.previous());
        } else {
          throw this.error(firstOperator, "Invalid syntax");
        }
      }
      const right = this.orExpr();
      comparisons.push(new ExprBinary(left, operators, right));
      left = right;
    }

    if (comparisons.length !== 0) {
      return new ExprComparison(comparisons);
    } else {
      return left;
    }
  }

  private orExpr(): Expr {
    let expr = this.xorExpr();

    while (this.match(TokenType.PIPE)) {
      const operators = [this.previous()];

      const right = this.xorExpr();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private xorExpr(): Expr {
    let expr = this.andExpr();

    while (this.match(TokenType.CARET)) {
      const operators = [this.previous()];

      const right = this.andExpr();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private andExpr(): Expr {
    let expr = this.shiftExpr();

    while (this.match(TokenType.AMPERSAND)) {
      const operators = [this.previous()];

      const right = this.shiftExpr();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private shiftExpr(): Expr {
    let expr = this.additiveExpr();

    while (this.match(TokenType.LESS_LESS, TokenType.GREATER_GREATER)) {
      const operators = [this.previous()];
      const right = this.additiveExpr();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private additiveExpr(): Expr {
    let expr = this.multiplicativeExpr();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operators = [this.previous()];
      const right = this.multiplicativeExpr();
      expr = new ExprBinary(expr, operators, right);
    }
    return expr;
  }

  private multiplicativeExpr(): Expr {
    let expr = this.unaryExpr();

    while (
      this.match(
        TokenType.STAR,
        TokenType.SLASH,
        TokenType.PERCENT,
        TokenType.SLASH_SLASH
      )
    ) {
      const operators = [this.previous()];

      const right = this.unaryExpr();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private unaryExpr(): Expr {
    if (this.match(TokenType.PLUS, TokenType.MINUS, TokenType.TILDE)) {
      return new ExprUnary(this.previous(), this.unaryExpr());
    } else {
      return this.power();
    }
  }

  private power(): Expr {
    let expr = this.atom();

    if (this.match(TokenType.STAR_STAR)) {
      const operators = [this.previous()];

      const right = this.power();
      expr = new ExprBinary(expr, operators, right);
    }

    return expr;
  }

  private atom(): Expr {
    if (this.match(TokenType.TRUE)) return new ExprLiteral(true);
    if (this.match(TokenType.FALSE)) return new ExprLiteral(false);
    if (this.match(TokenType.NONE)) return new ExprLiteral(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new ExprLiteral(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER, TokenType.COMMAND)) {
      return new ExprVariable(this.previous());
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      if (this.match(TokenType.COMMAND)) {
        return this.call();
      }

      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new ExprGrouping(expr);
    }

    throw this.error(this.peek(), "Expect expression.");
  }

  private match(...types: TokenType[]) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private check(type: TokenType) {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd() {
    const data = this.peek().type;
    return data == TokenType.EOF;
  }

  private peek() {
    return this.tokens[this.current];
  }

  private previous() {
    return this.tokens[this.current - 1];
  }

  // Error handling
  private error(token: Token, message: string) {
    return new LinSyntaxError(token.line + 1, token.column + 1, message);
  }

  private synchronize() {
    this.advance();
    while (!this.isAtEnd()) {
      if (this.previous().type == TokenType.NEWLINE) return;

      switch (this.peek().type) {
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.RETURN:
        case TokenType.WHILE:
        case TokenType.INIT:
        case TokenType.SET:
          return;
      }
      this.advance();
    }
  }
}
