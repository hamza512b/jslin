import Lexer from "./lexer";
import fs from "fs";
import { formatTokenType } from "./tokenType";

export function run(source: string) {
  const lexer = new Lexer(source);
  const tokens = lexer.scanAll();

  for (const token of tokens) {
    console.log(
      `${formatTokenType(token.type)}${!!token.literal ? ": " : ""}${
        token.literal || ""
      }`
    );
  }
}

export function runFile(path: string) {
  const source = fs.readFileSync(path, "utf-8");
  run(source);
}

runFile("test.txt");
