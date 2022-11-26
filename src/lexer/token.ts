export interface Token {
    value: string | Array<string|object>;
    type: TokenType;
    line: number;
    column: number;
    file: string;
    i: number;
    toString: () => string;
}

export enum TokenType {
    ASCIICharLiteral = 'ASCIICharLiteral',
    UnicodeCharLiteral = 'UnicodeCharLiteral',
    SymASCIICharLiteral = 'SymASCIICharLiteral',
    SymUnicodeCharLiteral = 'SymUnicodeCharLiteral',
    SymASCIIStringLiteral = 'SymASCIIStringLiteral',
    SymUnicodeStringLiteral = 'SymUnicodeStringLiteral',
    MultilineUnicodeStringLiteral = 'MultilineUnicodeStringLiteral',
    MultilineASCIIStringLiteral = 'MultilineASCIIStringLiteral',
    InlineUnicodeStringLiteral = 'InlineUnicodeStringLiteral',
    InlineASCIIStringLiteral = 'InlineASCIIStringLiteral',
    MultilineFormatString = 'MultilineFormatString',
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
    #index: number = 0;
    #length: number = 0;
    #isFinished: boolean = false;
    #tokens: Token[] = [];

    constructor(tokens: Token[]) {
        
        this.#tokens = tokens;
        this.#length = tokens.length;

        if(tokens.length === 0)
            this.#isFinished = true;
    }

    get length(): number { 
        return this.#length; 
    }

    get currentToken(): Token {
        return this.#tokens[this.#index];   
    }

    get nextToken(): Token | null {
        if (this.#index < this.#length - 1) {
            this.#index++;
            return this.#tokens[this.#index];
        }
        this.isFinished = true;
        return null;
    }

    set cursor(idx: number) {
        if(idx >= this.#length)
            throw new RangeError(`Index out of bound: must be less than ${this.#length}`)
        this.#index = idx
    }

    advance(): boolean {
        if (this.#index < this.#length - 1) {
            this.#index++;
            return true;
        }
        this.isFinished = true;
        return false;
    }

    peek(amount: number): Token | null {
        if (-amount > this.#index) {
            return null;
        }
        if (this.#index < this.#length - amount) {
            return this.#tokens[this.#index + amount];
        }
        return null;
    }

    get isFinished(): boolean {
        return this.#isFinished;
    }

    set isFinished(value: boolean) {
        this.#isFinished = value;
    }

    *[Symbol.iterator]() {
        while(!this.isFinished) {
            yield this.currentToken;
            this.advance();
        }
    }
}