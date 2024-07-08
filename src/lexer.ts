import { LinErrorCollection, LinSyntaxError } from "./errors";
import { Token } from "./token";
import { TokenType } from "./tokenType";

enum LexerState {
  NONE,
  IN_NUMBER,
  IN_STRING,
  IN_KEYS,
  IN_COMMENT,
  IN_OPERATOR,
  IN_NEWLINE,
  IN_INDENTATION,
}

export default class Lexer {
  private errors = new LinErrorCollection([]);
  private tokens: Token[] = [];
  private indentStack = [0];
  private indentationWhitespace = "\0";
  private lineNumber = 0;
  private columnNumber = 0;
  private firstIndex = 0;
  private currentIndex = 0;
  private source: string;
  private state = LexerState.NONE;
  private currentChar;

  private static keywords: Record<string, TokenType> = {
    true: TokenType.TRUE,
    false: TokenType.FALSE,
    none: TokenType.NONE,
    and: TokenType.AND,
    or: TokenType.OR,
    not: TokenType.NOT,
    if: TokenType.IF_I,
    else: TokenType.ELSE_I,
    elif: TokenType.ELIF_I,
    in: TokenType.IN,
    is: TokenType.IS,
    await: TokenType.AWAIT,
    PASS: TokenType.PASS,
    CONTINUE: TokenType.CONTINUE,
    RETURN: TokenType.RETURN,
    INIT: TokenType.INIT,
    SET: TokenType.SET,
    IF: TokenType.IF,
    ELSE: TokenType.ELSE,
    ELSIF: TokenType.ELIF,
    FOR: TokenType.FOR,
    WHILE: TokenType.WHILE,
    DEF: TokenType.DEF,
  };
  private static operators: Record<string, TokenType> = {
    "+": TokenType.PLUS,
    "-": TokenType.MINUS,
    "*": TokenType.STAR,
    "/": TokenType.SLASH,
    "//": TokenType.SLASH_SLASH,
    "%": TokenType.PERCENT,
    "=": TokenType.EQUAL,
    ".": TokenType.DOT,
    "<=": TokenType.LESS_EQUAL,
    ">=": TokenType.GREATER_EQUAL,
    "<": TokenType.LESS,
    ">": TokenType.GREATER,
    "==": TokenType.EQUAL_EQUAL,
    "!=": TokenType.BANG_EQUAL,
    "**": TokenType.STAR_STAR,
    "<<": TokenType.LESS_LESS,
    ">>": TokenType.GREATER_GREATER,
    "^": TokenType.CARET,
    "|": TokenType.PIPE,
    "&": TokenType.AMPERSAND,
    "~": TokenType.TILDE,
    "(": TokenType.LEFT_PAREN,
    ")": TokenType.RIGHT_PAREN,
    "[": TokenType.LEFT_BRACKET,
    "]": TokenType.RIGHT_BRACKET,
    ":": TokenType.COLON,
  };

  constructor(source: string) {
    this.source = source;
  }

  // Lexical analysis
  scanAll(): Token[] {
    while (!this.isAtEnd()) {
      this.firstIndex = this.currentIndex;
      this.advance();
      try {
        this.computeState();
        switch (this.state) {
          case LexerState.IN_NUMBER:
            this.inNumber();
            break;
          case LexerState.IN_STRING:
            this.inString();
            break;
          case LexerState.IN_KEYS:
            this.inKeys();
            break;
          case LexerState.IN_COMMENT:
            this.inComment();
            break;
          case LexerState.IN_OPERATOR:
            this.inOperator();
            break;
          case LexerState.IN_INDENTATION:
            this.inIndentation();
            break;
          case LexerState.IN_NEWLINE:
            this.inNewline();
            break;
          default:
            break;
        }
      } catch (error: any) {
        this.errors.push(error);
      }
    }

    while (0 < this.lastIndentation()) {
      this.indentStack.pop();
    }

    this.emit(TokenType.EOF);

    if (!this.errors.isEmpty()) {
      this.errors.reportAndThrow();
    }

    return this.tokens;
  }

  private inNewline() {
    if (this.currentChar == "\r" && this.peek() == "\n") {
      this.advance();
    }

    this.emit(TokenType.NEWLINE);
  }

  private computeState() {
    if (
      this.state == LexerState.IN_NEWLINE &&
      this.currentChar != " " &&
      this.currentChar != "\t"
    ) {
      while (0 < this.lastIndentation()) {
        this.indentStack.pop();
        this.emit(TokenType.DEDENT);
      }
    }

    if (
      (this.currentChar == " " || this.currentChar == "\t") &&
      this.state == LexerState.IN_NEWLINE
    ) {
      this.state = LexerState.IN_INDENTATION;
    } else if (
      this.currentChar == "\n" ||
      (this.currentChar == "\r" && this.peek() == "\n")
    ) {
      this.state = LexerState.IN_NEWLINE;
    } else if (this.isDigit(this.currentChar)) {
      this.state = LexerState.IN_NUMBER;
    } else if (this.currentChar == '"') {
      this.state = LexerState.IN_STRING;
    } else if (this.isAlpha(this.currentChar)) {
      this.state = LexerState.IN_KEYS;
    } else if (this.currentChar == "#") {
      this.state = LexerState.IN_COMMENT;
    } else if (this.isOperator(this.currentChar)) {
      this.state = LexerState.IN_OPERATOR;
    } else if (this.currentChar == " " || this.currentChar == "\t") {
      this.state = LexerState.NONE;
    } else {
      this.reportError("Unexpected character");
    }
  }

  private inIndentation() {
    if (this.indentationWhitespace == "\0") {
      this.indentationWhitespace = this.currentChar;
    }

    // This is set to 1 because we have already consumed one whitespace
    let count = 1;
    while (this.peek() == this.indentationWhitespace) {
      this.advance();
      count++;
    }

    if (count > this.lastIndentation()) {
      this.indentStack.push(count);
      this.emit(TokenType.INDENT);
    } else {
      while (count < this.lastIndentation()) {
        this.indentStack.pop();
        this.emit(TokenType.DEDENT);
      }
    }
  }

  private inNumber() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() == "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    let number = parseFloat(
      this.source.substring(this.firstIndex, this.currentIndex)
    );
    this.emit(TokenType.NUMBER, number);
  }

  private inString() {
    while (this.peek() != '"' && !this.isAtEnd()) {
      if (this.peek() == "\n") {
        this.reportError("Unterminated string");
      }
      this.advance();
    }

    if (this.isAtEnd()) {
      this.reportError("Unterminated string");
    }

    this.advance();
    this.emit(
      TokenType.STRING,
      this.source.substring(this.firstIndex + 1, this.currentIndex - 1)
    );
  }

  private inKeys() {
    while (this.isAlphaNumeric(this.peek()) && !this.isAtEnd()) {
      this.advance();
    }

    const text = this.source.substring(this.firstIndex, this.currentIndex);

    const type = Lexer.keywords[text];
    if (type != null) {
      this.emit(type);
      return;
    }

    if (text === text.toUpperCase()) {
      // Handle constants
      this.emit(TokenType.COMMAND, text);
      return;
    }

    if (text === text.toLowerCase()) {
      // Handle variables
      this.emit(TokenType.IDENTIFIER, text);
      return;
    }

    this.reportError("Invalid identifier");
  }

  private inComment() {
    while (this.peek() != "\n" && this.peek() != "\r" && !this.isAtEnd()) {
      this.advance();
    }

    const text = this.source.substring(this.firstIndex, this.currentIndex);
    this.emit(TokenType.COMMENT, text);
  }

  private inOperator() {
    while (this.isOperator(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.firstIndex, this.currentIndex);
    const type = Lexer.operators[text];
    if (type == null) {
      this.reportError("Invalid operator");
      return;
    }

    this.emit(type);
  }

  // Helper methods
  private peek() {
    if (this.currentIndex < this.source.length) {
      return this.source.charAt(this.currentIndex);
    }
    return "\0";
  }

  private peekNext() {
    if (this.currentIndex + 1 < this.source.length) {
      return this.source.charAt(this.currentIndex + 1);
    }
    return "\0";
  }

  lastIndentation() {
    return this.indentStack[this.indentStack.length - 1];
  }

  private advance() {
    if (this.isAtEnd()) {
      return;
    }

    if (this.source.charAt(this.currentIndex) == "\n") {
      this.lineNumber++;
      this.columnNumber = 0;
    } else {
      this.columnNumber++;
    }

    this.currentChar = this.source.charAt(this.currentIndex++);
  }

  private isAtEnd() {
    return this.currentIndex >= this.source.length;
  }

  private emit(type: TokenType, literal?: Object) {
    const lexeme = this.source.substring(this.firstIndex, this.currentIndex);
    this.tokens.push(
      new Token(
        type,
        lexeme,
        literal || null,
        this.lineNumber,
        this.columnNumber
      )
    );
  }

  private isDigit(c: string) {
    return /^[0-9]$/.test(c);
  }

  private isAlpha(c: string) {
    return /\w/.test(c);
  }

  private isAlphaNumeric(c: string) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isOperator(c: string) {
    return (
      c == "+" ||
      c == "-" ||
      c == "*" ||
      c == "/" ||
      c == "%" ||
      c == "=" ||
      c == "." ||
      c == "<" ||
      c == ">" ||
      c == "!" ||
      c == "&" ||
      c == "|" ||
      c == "^" ||
      c == "~" ||
      c == "(" ||
      c == ")" ||
      c == "[" ||
      c == "]" ||
      c == ":"
    );
  }

  // Error handling
  private reportError(message: string) {
    const error = new LinSyntaxError(
      this.lineNumber,
      this.columnNumber,
      message
    );
    this.state = LexerState.NONE;

    // Report the error
    throw error.getMessage();
  }
}
