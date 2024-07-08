import { describe, expect, test } from "vitest";
import Lexer from "../src/lexer";
import { TokenType } from "../src/tokenType";

describe("Lexer", () => {
  test("should scan basic tokens", () => {
    const lexer = new Lexer('PRINT "Hello, World!"');
    const tokens = lexer.scan();

    expect(tokens.length).toBe(3);

    const [print, string, eof] = tokens;

    expect(print.type).toBe(TokenType.COMMAND);
    expect(print.lexeme).toBe("PRINT");

    expect(string.type).toBe(TokenType.STRING);
    expect(string.lexeme).toBe('"Hello, World!"');

    expect(eof.type).toBe(TokenType.EOF);
  });

  test("should scan with new line", () => {
    const lexer = new Lexer('INIT value "Hello, World!"\nPRINT value\n');
    const tokens = lexer.scan();
    const types = [
      TokenType.INIT,
      TokenType.IDENTIFIER,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.COMMAND,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.EOF,
    ];

    expect(types.length).toBe(tokens.length);

    for (let i = 0; i < tokens.length; i++) {
      expect(types[i]).toBe(tokens[i].type);
    }

    const value = tokens[1];
    const print = tokens[4];

    expect(value.lexeme).toBe("value");
    expect(print.lexeme).toBe("PRINT");
  });

  test("should scan with indentation", () => {
    const lexer = new Lexer(
      "DEF ADD a b\n  IF a > b\n    PRINT a\n  ELSE\n    PRINT b\n"
    );
    const tokens = lexer.scan();

    const types = [
      TokenType.DEF,
      TokenType.COMMAND,
      TokenType.IDENTIFIER,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.IF,
      TokenType.IDENTIFIER,
      TokenType.GREATER,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.COMMAND,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.ELSE,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.COMMAND,
      TokenType.IDENTIFIER,
      TokenType.NEWLINE,
      TokenType.EOF,
    ];

    expect(types.length).toBe(tokens.length);

    for (let i = 0; i < tokens.length; i++) {
      expect(types[i]).toBe(tokens[i].type);
    }

    const add = tokens[1];
    const a = tokens[2];
    const b = tokens[3];
    const ifToken = tokens[6];
    const aGreaterThanB = tokens[8];
    const printA = tokens[12];
    const printB = tokens[19];

    expect(add.lexeme).toBe("ADD");
    expect(a.lexeme).toBe("a");
    expect(b.lexeme).toBe("b");
    expect(ifToken.lexeme).toBe("IF");
    expect(aGreaterThanB.lexeme).toBe(">");
    expect(printA.lexeme).toBe("PRINT");
    expect(printB.lexeme).toBe("PRINT");
  });

  test("should scan with deep indentation", () => {
    const lexer = new Lexer(
      'DEF VOID\n DEF SAY\n  DEF HI\n   PRINT "HI"\n DEF BYE\n  PRINT "BYE"\nVOID'
    );
    const tokens = lexer.scan();

    const types = [
      TokenType.DEF,
      TokenType.COMMAND,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.DEF,
      TokenType.COMMAND,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.DEF,
      TokenType.COMMAND,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.COMMAND,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.DEDENT,
      TokenType.DEF,
      TokenType.COMMAND,
      TokenType.NEWLINE,
      TokenType.INDENT,
      TokenType.COMMAND,
      TokenType.STRING,
      TokenType.NEWLINE,
      TokenType.DEDENT,
      TokenType.DEDENT,
      TokenType.COMMAND,
      TokenType.EOF,
    ];

    expect(types.length).toBe(tokens.length);

    for (let i = 0; i < tokens.length; i++) {
      expect(types[i]).toBe(tokens[i].type);
    }

    const voidToken = tokens[1];
    const sayToken = tokens[5];
    const hiToken = tokens[9];
    const printHi = tokens[12];
    const byeToken = tokens[18];
    const printBye = tokens[21];

    expect(voidToken.lexeme).toBe("VOID");
    expect(sayToken.lexeme).toBe("SAY");
    expect(hiToken.lexeme).toBe("HI");
    expect(printHi.lexeme).toBe("PRINT");
    expect(byeToken.lexeme).toBe("BYE");
    expect(printBye.lexeme).toBe("PRINT");
  });
});
