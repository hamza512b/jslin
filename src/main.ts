import fs from "fs";
import { printAst } from "./astPrinter";
import Interpreter from "./interpreter";
import Lexer from "./lexer";
import Parser from "./parser";
import { standardState } from "./standardlibrary";
import { formatTokenType } from "./tokenType";

export function run(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.scan();

  for (const token of tokens) {
    console.log(
      `${formatTokenType(token.type)}${!!token.literal ? ": " : ""}${
        token.literal || ""
      }`
    );
  }

  const parser = new Parser(tokens);
  const statements = parser.parse();

  printAst(statements);

  const interpreter = new Interpreter(standardState);
  interpreter.interpret(statements);
}

export function runFile(path: string) {
  const source = fs.readFileSync(path, "utf-8");
  run(source);
}

runFile("test.txt");
