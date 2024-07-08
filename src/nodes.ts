import { Token } from "./token";

export abstract class Cmd {
  static Expression: any;
  abstract accept<R>(visitor: CmdVisitor<R>): R;
}

export abstract class CmdVisitor<R> {
  abstract visitConditionCmd(cmd: CmdCondition): R;
  abstract visitLoopCmd(cmd: CmdLoop): R;
  abstract visitDefinitionCmd(cmd: CmdDefinition): R;
  abstract visitReturnCmd(cmd: CmdReturn): R;
  abstract visitSetCmd(cmd: CmdSet): R;
  abstract visitInitCmd(cmd: CmdInit): R;
  abstract visitExpressionCmd(cmd: CmdExpression): R;
  abstract visitBodyCmd(cmd: CmdBody): R;
}
export class CmdCondition extends Cmd {
  constructor(
    conditional: Expr,
    thenBranch: CmdBody,
    elseBranch: CmdBody | null
  ) {
    super();
    this.conditional = conditional;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitConditionCmd(this);
  }

  conditional: Expr;
  thenBranch: CmdBody;
  elseBranch: CmdBody | null;
}

export class CmdLoop extends Cmd {
  constructor(condition: Expr, body: CmdBody) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitLoopCmd(this);
  }

  condition: Expr;
  body: CmdBody;
}

export class CmdDefinition extends Cmd {
  constructor(name: Token, params: Token[], body: CmdBody) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitDefinitionCmd(this);
  }

  name: Token;
  params: Token[];
  body: CmdBody;
}

export class CmdReturn extends Cmd {
  constructor(value: Expr) {
    super();
    this.value = value;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitReturnCmd(this);
  }

  value: Expr;
}

export class CmdSet extends Cmd {
  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitSetCmd(this);
  }

  name: Token;
  value: Expr;
}

export class CmdInit extends Cmd {
  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitInitCmd(this);
  }

  name: Token;
  value: Expr;
}

export class CmdExpression extends Cmd {
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitExpressionCmd(this);
  }

  expression: Expr;
}

export class CmdBody extends Cmd {
  constructor(statements: Cmd[]) {
    super();
    this.statements = statements;
  }

  accept<R>(visitor: CmdVisitor<R>) {
    return visitor.visitBodyCmd(this);
  }

  statements: Cmd[];
}

export abstract class ExprVisitor<R> {
  abstract visitGroupingExpr(expr: ExprGrouping): R;
  abstract visitBinaryExpr(expr: ExprBinary): R;
  abstract visitLiteralExpr(expr: ExprLiteral): R;
  abstract visitUnaryExpr(expr: ExprUnary): R;
  abstract visitTernaryExpr(expr: ExprTernary): R;
  abstract visitVariableExpr(expr: ExprVariable): R;
  abstract visitComparisonExpr(expr: ExprComparison): R;
  abstract visitCallExpr(expr: ExprCall): R;
}

export abstract class Expr {
  static Variable: any;
  abstract accept<R>(visitor: ExprVisitor<R>): R;
}

export class ExprGrouping extends Expr {
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitGroupingExpr(this);
  }

  expression: Expr;
}

export class ExprBinary extends Expr {
  constructor(left: Expr, operators: Token[], right: Expr) {
    super();
    this.left = left;
    this.operators = operators;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitBinaryExpr(this);
  }

  left: Expr;
  operators: Token[];
  right: Expr;
}

export class ExprLiteral extends Expr {
  constructor(value: any) {
    super();
    this.value = value;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitLiteralExpr(this);
  }

  value: any;
}

export class ExprUnary extends Expr {
  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitUnaryExpr(this);
  }

  operator: Token;
  right: Expr;
}

export class ExprTernary extends Expr {
  constructor(left: Expr, condition: Expr, right: Expr) {
    super();
    this.left = left;
    this.condition = condition;
    this.right = right;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitTernaryExpr(this);
  }

  left: Expr;
  condition: Expr;
  right: Expr;
}

export class ExprVariable extends Expr {
  constructor(name: Token) {
    super();
    this.name = name;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitVariableExpr(this);
  }
  name: Token;
}

export class ExprComparison extends Expr {
  constructor(comparisons: ExprBinary[]) {
    super();
    this.comparisons = comparisons;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitComparisonExpr(this);
  }

  comparisons: ExprBinary[];
}

export class ExprCall extends Expr {
  constructor(name: Token, args: Expr[]) {
    super();
    this.name = name;
    this.arguments = args;
  }

  accept<R>(visitor: ExprVisitor<R>) {
    return visitor.visitCallExpr(this);
  }

  name: Token;
  arguments: Expr[];
}
