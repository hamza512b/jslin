import { describe, expect, test } from "vitest";
import Lexer from "../src/lexer";
import Parser from "../src/parser";
import { TokenType } from "../src/tokenType";
import {
  CmdDefinition,
  CmdExpression,
  ExprBinary,
  ExprCall,
  ExprComparison,
  ExprTernary,
} from "../src/nodes";

describe("Parser", () => {
  test("should parse indentation", () => {
    const source = "DEF HELLO\n    DEF SUM\n        PRINT 1 + 2\n\n    SUM";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);

    const cmds = parser.parse();
    expect(cmds.length).toBe(1);
  });

  test("should parse without indentation", () => {
    const source = "DEF HELLO\n DEF SUM  \n   PRINT 1 + 2\nSUM";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);

    const cmds = parser.parse();
    expect(cmds.length).toBe(2);
  });

  test("should parse empty", () => {
    const source = "";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);

    const cmds = parser.parse();
    expect(cmds.length).toBe(0);
  });

  test("should parse ternary", () => {
    const source =
      "DEF SUM\n    PRINT 1 + 2 if 1 + 2 > 2 else 2 + 3\nPRINT SUM";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    const cmds = parser.parse();

    expect(cmds.length).toBe(2);

    const definition = cmds[0];
    if (!(definition instanceof CmdDefinition)) {
      throw new Error("Definition not found");
    }
    const expressionStatement = definition?.body?.statements[0];
    if (!(expressionStatement instanceof CmdExpression)) {
      throw new Error("Expression not found");
    }
    const call = expressionStatement.expression;
    if (!(call instanceof ExprCall)) {
      throw new Error("Call not found");
    }
    const ternary = call.arguments[0];
    if (!(ternary instanceof ExprTernary)) {
      throw new Error("Ternary not found");
    }
    const condition = ternary.condition;

    if (!(condition instanceof ExprComparison)) {
      throw new Error("Condition not found");
    }
    const left = ternary.left;
    if (!(left instanceof ExprBinary)) {
      throw new Error("Left not found");
    }

    const right = ternary.right;

    if (!(right instanceof ExprBinary)) {
      throw new Error("Right not found");
    }

    expect(condition.comparisons[0].operators[0].type).toBe(TokenType.GREATER);
    expect(left.operators[0].type).toBe(TokenType.PLUS);
    expect(right.operators[0].type).toBe(TokenType.PLUS);
  });

  test("should parse comparison", () => {
    const source = "DEF SUM\n    PRINT 4 >= 2 < 3\nPRINT";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    const cmds = parser.parse();

    expect(cmds.length).toBe(2);

    const definition = cmds[0];
    if (!(definition instanceof CmdDefinition)) {
      throw new Error("Definition not found");
    }
    const expressionResult = definition.body.statements[0];
    if (!(expressionResult instanceof CmdExpression)) {
      throw new Error("Expression not found");
    }
    const call = expressionResult.expression;
    if (!(call instanceof ExprCall)) {
      throw new Error("Call not found");
    }
    const comparison = call.arguments[0];
    if (!(comparison instanceof ExprComparison)) {
      throw new Error("Comparison not found");
    }
    const left = comparison.comparisons[0];
    const right = comparison.comparisons[1];

    expect(left.operators[0].lexeme).toBe(">=");
    expect(right.operators[0].lexeme).toBe("<");
  });

  test("should not parse incorrect init", () => {
    const source = "INIT a 1 2";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow();
  });

  test("should not parse incorrect set", () => {
    const source = "SET a 1 2";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    expect(() => parser.parse()).toThrow();
  });
});
