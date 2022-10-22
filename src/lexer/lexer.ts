import { type Token, TokenStream, TokenType } from "./token.js";

export function tokenize(code: string, fileName: string = ""): TokenStream {
    const tokens: Token[] = [];
    code = code.trim()

    let line = 1;
    let pos = 1;
    const isAlpha = (char: string) => (/\p{L}|_/u).test(char);
    const isAlNum = (char: string) => (/\p{L}|\d|_/u).test(char);
    const isDigit = (char: string) => (/\d/u).test(char);

    const keywords = [
        "done", "do", "fun", "var", "val", "type",
        "data", "expr", "end", "ref", "stmt", "static",
        "return", "yield", "break", "continue", "case",
        "if", "elseif", "else", "for", "try", "catch",
        "throw", "in!", "in", "self", "meta", "payload",
        "of", "use!", "use", "import", "export", "from",
        "getter", "setter", "to", "is!", "is", "as", "await"
    ]

    for (let i = 0; i < code.length; i++) {
        let char = code[i];
        if (isAlpha(char)) { // identifier | keyword
            let res = "";
            const startPos = pos;
            ({ res, i, pos, char } = parseIdentifier(char, i, pos));
            tokens.push({
                value: res,
                type: keywords.includes(res) ? TokenType.Keyword : TokenType.Identifier,
                line: line,
                column: startPos,
                file: fileName,
            });
        }
        else {
            pos++;
        }
    }

    function parseIdentifier(char: string, i: number, pos: number) {
        let res = "";
        while (char && isAlNum(char)) {
            res += char;
            i++;
            pos++;
            char = code[i];
        }
        if (char && char == "!") {
            res += char;
            i++;
            pos++;
            char = code[i];
        }
        while (char && char == "'") {
            res += char;
            i++;
            pos++;
            char = code[i];
        }
        return { res, i, pos, char };
    }

    console.dir(tokens)
    return new TokenStream(tokens);
}

function parseNumber(char: string, i: number, pos: number) {
    
}

/*
    sign? digit+ (dot digit+)?
 */