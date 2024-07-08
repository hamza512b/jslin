import { afterAll, describe, it, expect, vi, test } from "vitest";
import Lexer from "../src/lexer";
import Parser from "../src/parser";
import Interpreter from "../src/interpreter";
import { Environment } from "../src/environment";
import { standardState } from "../src/standardlibrary";

describe("should mock console.log", () => {
  const consoleMock = vi
    .spyOn(console, "log")
    .mockImplementation(() => undefined);

  afterAll(() => {
    consoleMock.mockReset();
  });

  // it("should log `sample output`", () => {
  //   console.log("sample output");
  //   expect(consoleMock).toHaveBeenCalledOnce();
  //   expect(consoleMock).toHaveBeenLastCalledWith("sample output");
  // });

  test("fail with duplicate variable", () => {
    const source = "INIT a 1\nINIT a 2";
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter(new Environment());
    expect(() => interpreter.interpret(ast)).toThrowError();
  });

  test("interpret if", () => {
    const source = `IF true\n    PRINT \"True\"\nELSE\n    PRINT \"False\"`;
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter(standardState);
    interpreter.interpret(ast);
    expect(consoleMock).toHaveBeenLastCalledWith("True");
  });

  test("interpret while", () => {
    const source = `INIT i 0\nWHILE i < 5\n    PRINT i\n    SET i i + 1`;
    const tokens = new Lexer(source).scan();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const interpreter = new Interpreter(standardState);
    interpreter.interpret(ast);
    expect(consoleMock).toHaveBeenLastCalledWith("4");
  });
});
