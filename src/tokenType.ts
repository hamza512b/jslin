export enum TokenType {
  // Whitespace
  INDENT,
  DEDENT,
  NEWLINE,
  EOF,

  // Single character operators
  PLUS,
  MINUS,
  STAR,
  SLASH,
  PERCENT,
  EQUAL,
  DOT,
  HASH,

  // Double character operators
  LESS_EQUAL,
  GREATER_EQUAL,
  EQUAL_EQUAL,
  BANG_EQUAL,
  STAR_STAR,
  LESS,
  GREATER,
  CARET,
  LEFT_SHIFT,
  RIGHT_SHIFT,
  LESS_LESS,
  GREATER_GREATER,
  AT,
  SLASH_SLASH,
  TILDE,
  PIPE,
  AMPERSAND,
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACKET,
  RIGHT_BRACKET,
  COLON,

  // Literals
  NUMBER,
  STRING,
  COMMENT,
  COMMAND,
  IDENTIFIER,

  // Keywords
  AND,
  OR,
  NOT,
  IF_I,
  ELSE_I,
  ELIF_I,
  WHILE,
  FOR,
  IN,
  AWAIT,
  IS,
  PASS,
  CONTINUE,
  TRUE,
  FALSE,
  NONE,
  RETURN,
  INIT,
  SET,
  IF,
  ELSE,
  ELIF,
  DEF,
}

export function formatTokenType(type: TokenType): string {
  switch (type) {
    case TokenType.INDENT:
      return "INDENT";
    case TokenType.DEDENT:
      return "DEDENT";
    case TokenType.NEWLINE:
      return "NEWLINE";
    case TokenType.EOF:
      return "EOF";
    case TokenType.PLUS:
      return "PLUS";
    case TokenType.MINUS:
      return "MINUS";
    case TokenType.STAR:
      return "STAR";
    case TokenType.SLASH:
      return "SLASH";
    case TokenType.PERCENT:
      return "PERCENT";
    case TokenType.EQUAL:
      return "EQUAL";
    case TokenType.DOT:
      return "DOT";
    case TokenType.HASH:
      return "HASH";
    case TokenType.LESS_EQUAL:
      return "LESS_EQUAL";
    case TokenType.GREATER_EQUAL:
      return "GREATER_EQUAL";
    case TokenType.EQUAL_EQUAL:
      return "EQUAL_EQUAL";
    case TokenType.BANG_EQUAL:
      return "BANG_EQUAL";
    case TokenType.STAR_STAR:
      return "STAR_STAR";
    case TokenType.LESS:
      return "LESS";
    case TokenType.GREATER:
      return "GREATER";
    case TokenType.CARET:
      return "CARET";
    case TokenType.LEFT_SHIFT:
      return "LEFT_SHIFT";
    case TokenType.RIGHT_SHIFT:
      return "RIGHT_SHIFT";
    case TokenType.LESS_LESS:
      return "LESS_LESS";
    case TokenType.GREATER_GREATER:
      return "GREATER_GREATER";
    case TokenType.AT:
      return "AT";
    case TokenType.SLASH_SLASH:
      return "SLASH_SLASH";
    case TokenType.TILDE:
      return "TILDE";
    case TokenType.PIPE:
      return "PIPE";
    case TokenType.AMPERSAND:
      return "AMPERSAND";
    case TokenType.LEFT_PAREN:
      return "LEFT_PAREN";
    case TokenType.RIGHT_PAREN:
      return "RIGHT_PAREN";
    case TokenType.LEFT_BRACKET:
      return "LEFT_BRACKET";
    case TokenType.RIGHT_BRACKET:
      return "RIGHT_BRACKET";
    case TokenType.COLON:
      return "COLON";
    case TokenType.NUMBER:
      return "NUMBER";
    case TokenType.STRING:
      return "STRING";
    case TokenType.COMMENT:
      return "COMMENT";
    case TokenType.COMMAND:
      return "COMMAND";
    case TokenType.IDENTIFIER:
      return "IDENTIFIER";
    case TokenType.AND:
      return "AND";
    case TokenType.OR:
      return "OR";
    case TokenType.NOT:
      return "NOT";
    case TokenType.IF_I:
      return "IF_I";
    case TokenType.ELSE_I:
      return "ELSE_I";
    case TokenType.ELIF_I:
      return "ELIF_I";
    case TokenType.WHILE:
      return "WHILE";
    case TokenType.FOR:
      return "FOR";
    case TokenType.IN:
      return "IN";
    case TokenType.AWAIT:
      return "AWAIT";
    case TokenType.IS:
      return "IS";
    case TokenType.PASS:
      return "PASS";
    case TokenType.CONTINUE:
      return "CONTINUE";
    case TokenType.TRUE:
      return "TRUE";
    case TokenType.FALSE:
      return "FALSE";
    case TokenType.NONE:
      return "NONE";
    case TokenType.RETURN:
      return "RETURN";
    case TokenType.INIT:
      return "INIT";
    case TokenType.SET:
      return "SET";
    case TokenType.IF:
      return "IF";
    case TokenType.ELSE:
      return "ELSE";
    case TokenType.ELIF:
      return "ELIF";
    case TokenType.DEF:
      return "DEF";
  }
}
