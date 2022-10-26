export interface Token {
    value: string | Array<string|object>;
    type: TokenType;
    line: number;
    column: number;
    file: string;
}

export enum TokenType {
    ASCIICharLiteral = 'ASCIICharLiteral',
    UnicodeCharLiteral = 'UnicodeCharLiteral',
    SymASCIICharLiteral = 'SymASCIICharLiteral',
    SymUnicodeCharLiteral = 'SymUnicodeCharLiteral',
    SymASCIIStringLiteral = 'SymASCIIStringLiteral',
    SymUnicodeStringLiteral = 'SymUnicodeStringLiteral',
    InlineUnicodeStringLiteral = 'InlineUnicodeStringLiteral',
    InlineASCIIStringLiteral = 'InlineASCIIStringLiteral',
    InlineFormatString = 'InlineFormatString',
    IntegerLiteral = 'IntegerLiteral',
    FloatLiteral = 'FloatLiteral',
    Identifier = 'Identifier',
    Newline = 'Newline',
    Keyword = 'Keyword',
    Operator = 'Operator',
    Punctuator = 'Punctuator',
    WhiteSpace = 'WhiteSpace',
    BraceEnclosed = 'BraceEnclosed',
    ParenEnclosed = 'ParenEnclosed',
    EscapeSequence = 'EscapeSequence',
    BracketEnclosed = 'BracketEnclosed',
    MultiLineComment = 'MultiLineComment',
    SingleLineComment = 'SingleLineComment',
}

export class TokenStream {
    private index: number = 0;
    private length: number = 0;
    private finished: boolean = false;

    public constructor(private tokens: Token[]) {
        this.length = tokens.length;
    }

    public get getLength(): number { 
        return this.length; 
    }

    public currentToken(): Token {
        return this.tokens[this.index];   
    }

    public nextToken(): Token | null {
        if (this.index < this.length - 1) {
            this.index++;
            return this.tokens[this.index];
        }
        this.finished = true;
        return null;
    }

    public advance(): boolean {
        if (this.index < this.length - 1) {
            this.index++;
            return true;
        }
        this.finished = true;
        return false;
    }

    public peek(amount: number): Token | null {
        if (-amount > this.index) {
            return null;
        }
        if (this.index < this.length - amount) {
            return this.tokens[this.index + amount];
        }
        return null;
    }

    public isFinished(): boolean {
        return this.finished;
    }

}