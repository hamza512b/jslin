import { LinCallable, LinFunction, Return } from "./callable";
import { Environment } from "./environment";
import { LinRuntimeError, LinSyntaxError } from "./errors";
import {
  Cmd,
  CmdBody,
  CmdCondition,
  CmdDefinition,
  CmdExpression,
  CmdInit,
  CmdLoop,
  CmdReturn,
  CmdVisitor,
  Expr,
  ExprBinary,
  ExprCall,
  ExprComparison,
  ExprGrouping,
  ExprLiteral,
  ExprTernary,
  ExprUnary,
  ExprVariable,
  ExprVisitor,
} from "./nodes";
import { TokenType } from "./tokenType";

export default class Interpreter implements ExprVisitor<any>, CmdVisitor<void> {
  protected data: Environment;

  constructor(environment: Environment) {
    this.data = environment;
  }

  interpret(cmds: Cmd[]) {
    try {
      for (const cmd of cmds) {
        this.execute(cmd);
      }
    } catch (error: any) {
      if (error instanceof LinRuntimeError) {
        error.reportAndThrow();
        return;
      }
    }
  }

  visitGroupingExpr(expr: ExprGrouping): any {
    return this.evaluate(expr.expression);
  }

  visitBinaryExpr(expr: ExprBinary): any {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    const operator1 = expr.operators[0];

    switch (operator1.type) {
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }

        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers or two strings."
        );
      case TokenType.MINUS:
        if (typeof left === "number" && typeof right === "number") {
          return left - right;
        }

        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.SLASH:
        if (typeof left === "number" && typeof right === "number") {
          return left / right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.STAR:
        if (typeof left === "number" && typeof right === "number") {
          return left * right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.GREATER:
        if (typeof left === "number" && typeof right === "number") {
          return left > right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.GREATER_EQUAL:
        if (typeof left === "number" && typeof right === "number") {
          return left >= right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.STAR_STAR:
        if (typeof left === "number" && typeof right === "number") {
          return Math.pow(left, right);
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.SLASH_SLASH:
        if (typeof left === "number" && typeof right === "number") {
          const reminder = left % right;
          return left - reminder;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.PERCENT:
        if (typeof left === "number" && typeof right === "number") {
          return left % right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.AMPERSAND:
        if (typeof left === "number" && typeof right === "number") {
          return left & right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.PIPE:
        if (typeof left === "number" && typeof right === "number") {
          return left | right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.CARET:
        if (typeof left === "number" && typeof right === "number") {
          return left ^ right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.GREATER_GREATER:
        if (typeof left === "number" && typeof right === "number") {
          return left >> right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.LESS_LESS:
        if (typeof left === "number" && typeof right === "number") {
          return left << right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );

      case TokenType.LESS:
        if (typeof left === "number" && typeof right === "number") {
          return left < right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.LESS_EQUAL:
        if (typeof left === "number" && typeof right === "number") {
          return left <= right;
        }
        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.AND:
        return this.isTruthy(left) && this.isTruthy(right);
      case TokenType.OR:
        return this.isTruthy(left) || this.isTruthy(right);
      case TokenType.IS:
        if (typeof left === "number" && typeof right === "number") {
          const operator2 =
            expr.operators.length > 1 ? expr.operators[1] : null;
          if (operator2 != null && TokenType.NOT == operator2.type) {
            return !this.isEqual(left, right);
          }
        }

        throw LinSyntaxError.fromToken(
          operator1,
          "Operands must be two numbers."
        );
      default:
        throw LinSyntaxError.fromToken(operator1, "Invalid operator.");
    }
  }

  visitLiteralExpr(expr: ExprLiteral): any {
    return expr.value;
  }

  visitUnaryExpr(expr: ExprUnary): any {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.NOT:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        if (typeof right === "number") {
          return -right;
        }
        throw LinSyntaxError.fromToken(
          expr.operator,
          "Operand must be a number."
        );
      case TokenType.TILDE:
        if (typeof right === "number") {
          return ~right;
        }
        throw LinSyntaxError.fromToken(
          expr.operator,
          "Operand must be a number."
        );
    }

    // Unreachable
    return null;
  }

  visitTernaryExpr(expr: ExprTernary): any {
    const condition = this.evaluate(expr.condition);
    if (this.isTruthy(condition)) {
      return this.evaluate(expr.left);
    } else {
      return this.evaluate(expr.right);
    }
  }

  visitVariableExpr(expr: ExprVariable): any {
    return this.data.get(expr.name.lexeme);
  }

  visitComparisonExpr(expr: ExprComparison): any {
    for (const comparison of expr.comparisons) {
      if (!this.evaluate(comparison)) {
        return false;
      }
    }

    return true;
  }

  visitCallExpr(expr: ExprCall): any {
    const call = this.data.get(expr.name.lexeme);

    if (call == null) {
      throw new LinRuntimeError("Command not found.");
    }

    const args: any[] = [];
    for (const argument of expr.arguments) {
      args.push(this.evaluate(argument));
    }

    if (!(call instanceof LinCallable)) {
      throw new LinRuntimeError("Can only call functions.");
    }

    if (args.length != call.arity() && call.arity() != -1) {
      throw new LinRuntimeError(
        "Expected " + call.arity() + " arguments but got " + args.length + "."
      );
    }

    return call.call(this, args);
  }

  private evaluate(expr: Expr): any {
    return expr.accept(this);
  }

  private execute(cmd: Cmd): any {
    cmd.accept(this);
  }

  private isTruthy(object: any) {
    if (object == null) return false;
    if (typeof object === "boolean") return object;
    return true;
  }

  private isEqual(a: any, b: any) {
    if (a == null && b == null) return true;
    if (a == null) return false;

    return a.equals(b);
  }

  public visitConditionCmd(cmd: CmdCondition): any {
    const asd = this.evaluate(cmd.conditional);
    if (this.isTruthy(asd)) {
      this.executeBlock(cmd.thenBranch, this.data);
    } else if (cmd.elseBranch != null) {
      this.executeBlock(cmd.elseBranch, this.data);
    }
    return null;
  }

  public visitLoopCmd(cmd: CmdLoop) {
    while (this.isTruthy(this.evaluate(cmd.condition))) {
      this.executeBlock(cmd.body, this.data);
    }
    return null;
  }

  public visitDefinitionCmd(cmd: CmdDefinition) {
    const func = new LinFunction(cmd, this.data);
    this.data.add(cmd.name.lexeme, func);
    return null;
  }

  public visitReturnCmd(cmd: CmdReturn) {
    let value: any = null;
    if (cmd.value != null) {
      value = this.evaluate(cmd.value);
    }

    throw new Return(value);
  }

  public visitSetCmd(command: any) {
    const value = this.evaluate(command.value);
    this.data.set(command.name.lexeme, value);
    return null;
  }

  public visitInitCmd(command: CmdInit) {
    let value = null;

    if (command.value != null) {
      value = this.evaluate(command.value);
    }

    this.data.add(command.name.lexeme, value);
    return null;
  }

  public visitExpressionCmd(command: CmdExpression) {
    this.evaluate(command.expression);
    return null;
  }

  public visitBodyCmd(cmd: CmdBody) {
    this.executeBlock(cmd, this.data);
    return null;
  }

  public executeBlock(body: CmdBody, copy: Environment) {
    const previous = this.data;
    try {
      this.data = copy;
      body.statements.forEach((statement) => this.execute(statement));
    } finally {
      this.data = previous;
    }
  }
}
