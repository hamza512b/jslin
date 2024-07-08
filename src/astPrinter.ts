import exp from "constants";
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

export class AstPrinter implements ExprVisitor<String>, CmdVisitor<String> {
  nesting = 0;
  constructor() {
    this.nesting = 0;
  }

  print(cmd: Cmd[]) {
    return cmd.map((c) => c.accept(this)).join("\n");
  }

  visitBinaryExpr(expr: ExprBinary) {
    return this.parenthesize(
      expr.operators.map((o) => o.lexeme).join(" "),
      expr.left,
      expr.right
    );
  }

  visitGroupingExpr(expr: ExprGrouping) {
    return this.parenthesize("group", expr.expression);
  }

  visitLiteralExpr(expr: ExprLiteral) {
    if (expr.value == null) return "none";

    // Red color
    if (typeof expr.value === "string") {
      return '\x1b[0;31m"' + expr.value + '"\x1b[0m';
    } else if (typeof expr.value === "number") {
      // Green color
      return "\x1b[0;32m" + expr.value + "\x1b[0m";
    } else if (typeof expr.value === "boolean") {
      // Blue color
      return "\x1b[0;34m" + expr.value + "\x1b[0m";
    } else {
      // gray color
      return "\x1b[0;37m" + expr.value + "\x1b[0m";
    }
  }

  visitUnaryExpr(expr: ExprUnary) {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  visitTernaryExpr(expr: ExprTernary) {
    return this.parenthesize("ternary", expr.condition, expr.left, expr.right);
  }

  visitVariableExpr(expr: ExprVariable) {
    return expr.name.lexeme;
  }

  visitComparisonExpr(expr: ExprComparison) {
    return this.parenthesize("comp", ...expr.comparisons);
  }

  visitCallExpr(expr: ExprCall) {
    return this.parenthesize(expr.name.lexeme.toString(), ...expr.arguments);
  }

  visitSetCmd(command: CmdSet) {
    return this.parenthesizeString(
      "SET",
      command.name.lexeme,
      command.value.accept(this)
    );
  }

  visitInitCmd(command: CmdInit) {
    return this.parenthesizeString(
      "INIT",
      command.name.lexeme,
      command.value.accept(this)
    );
  }

  visitExpressionCmd(command: CmdExpression) {
    return command.expression.accept(this);
  }

  visitBodyCmd(cmd: CmdBody) {
    this.nesting++;
    let str = `(\n${cmd.statements
      .map((c) => " ".repeat(this.nesting * 2) + c.accept(this))
      .join("\n")}\n${" ".repeat((this.nesting - 1) * 2)})`;
    this.nesting--;
    return str;
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    return `(${name} ${exprs.map((e) => e.accept(this)).join(" ")})`;
  }

  visitConditionCmd(cmd: CmdCondition) {
    if (!cmd.elseBranch)
      return this.parenthesizeString(
        "IF",
        cmd.conditional.accept(this),
        cmd.thenBranch.accept(this)
      );

    return this.parenthesizeString(
      "IF",
      cmd.conditional.accept(this),
      cmd.thenBranch.accept(this),
      cmd.elseBranch.accept(this)
    );
  }

  private parenthesizeString(name: string, ...strings: string[]): string {
    return `(${name} ${strings.filter(Boolean).join(" ")})`;
  }

  visitLoopCmd(cmd: CmdLoop) {
    return this.parenthesizeString(
      "WHILE",
      cmd.condition.accept(this),
      cmd.body.accept(this)
    );
  }

  visitDefinitionCmd(cmd: CmdDefinition) {
    return this.parenthesizeString(
      "DEF",
      cmd.name.lexeme,
      cmd.params
        .map((p) => p.lexeme.trim())
        .filter(Boolean)
        .join(" "),
      cmd.body.accept(this)
    );
  }

  visitReturnCmd(cmd: CmdReturn) {
    return this.parenthesize("RETURN", cmd.value);
  }
}

export function printAst(cmds: Cmd[]) {
  const printer = new AstPrinter();
  console.log(printer.print(cmds));
}
