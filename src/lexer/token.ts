export interface Token {
    value: string | Array<string|object>;
    type: TokenType;
    line: number;
    column: number;
    file: string;
}

export enum TokenType {
    Punctuator = 'Punctuator',
    CharLiteral = 'CharLiteral',
    InlineFormatString = 'InlineFormatString',
    InlineStringLiteral = 'InlineStringLiteral',
    IntegerLiteral = 'IntegerLiteral',
    FloatLiteral = 'FloatLiteral',
    OperatorRef = 'OperatorRef',
    Identifier = 'Identifier',
    Newline = 'Newline',
    Keyword = 'Keyword',
    Operator = 'Operator',
    WhiteSpace = 'WhiteSpace',
    ImplicitMult = 'ImplicitMult',
    SymbolLiteral = 'SymbolLiteral',
    ParenEnclosed = 'ParenEnclosed',
    BraceEnclosed = 'BraceEnclosed',
    EscapeSequence = 'EscapeSequence',
    BracketEnclosed = 'BracketEnclosed',
    SingleLineComment = 'SingleLineComment',
    MultiLineComment = 'MultiLineComment'
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